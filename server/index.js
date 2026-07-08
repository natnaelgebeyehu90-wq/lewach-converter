import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Your other imports follow below...
import express from 'express';
// ...
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from 'ffmpeg-static';
import PDFDocument from 'pdfkit';
import AdmZip from 'adm-zip';
import Tesseract from 'tesseract.js';
import mongoose from 'mongoose'; // Added for DB
import dotenv from 'dotenv'; // Added for security
import { OAuth2Client } from 'google-auth-library'; // Added for Google Auth
import jwt from 'jsonwebtoken'; // Added for session management
import { User } from './models/User.js';// Ensure you have this file created

import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config(); // Load your .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegInstaller);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// --- GOOGLE AUTHENTICATION SETUP ---
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- AUTH ROUTE ---
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email, name, picture });
      await user.save();
    }

    const sessionToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Success', token: sessionToken, user: { name: user.name, email: user.email, picture: user.picture } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid Google Token' });
  }
});

// --- EXISTING FILE CONVERSION LOGIC ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage });

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
if (!fs.existsSync('./converted')) fs.mkdirSync('./converted');

app.post('/api/convert', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  // ... (Keep the rest of your existing conversion logic here exactly as it was)
  const targetFormat = req.body.targetFormat; 
  const inputPath = req.file.path;
  const mimeType = req.file.mimetype; 
  const ext = path.extname(req.file.originalname).toLowerCase();
  
  const originalNameWithoutExt = path.parse(req.file.originalname).name;
  const outputFilename = `${originalNameWithoutExt}.${targetFormat}`;
  const outputPath = path.join(__dirname, 'converted', outputFilename);

  try {
    // 1. IMAGES
    if (mimeType.startsWith('image/')) {
      if (targetFormat === 'txt') {
        const { data: { text } } = await Tesseract.recognize(inputPath, 'eng');
        fs.writeFileSync(outputPath, text);
        fs.unlinkSync(inputPath);
        return res.json({ downloadUrl: `${req.protocol}://${req.get('host')}/api/download/${outputFilename}` });
      }
      else if (targetFormat === 'pdf') {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        doc.image(inputPath, { fit: [500, 700], align: 'center', valign: 'center' });
        doc.end();
        stream.on('finish', () => {
          fs.unlinkSync(inputPath);
          return res.json({ downloadUrl: `${req.protocol}://${req.get('host')}/api/download/${outputFilename}`});
        });
        return;
      } 
      else {
        await sharp(inputPath).toFormat(targetFormat).toFile(outputPath);
        fs.unlinkSync(inputPath);
        return res.json({ downloadUrl: `${req.protocol}://${req.get('host')}/api/download/${outputFilename}`});
      }
    } 
    // 2. VIDEO & AUDIO
    if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath).toFormat(targetFormat)
          .on('end', resolve).on('error', reject).save(outputPath);
      });
      fs.unlinkSync(inputPath);
      return res.json({ downloadUrl: `${req.protocol}://${req.get('host')}/api/download/${outputFilename}`});
    } 
    // 3. ARCHIVES
    if (ext === '.zip' && targetFormat === 'zip') {
        const zip = new AdmZip(inputPath);
        zip.writeZip(outputPath);
        fs.unlinkSync(inputPath);
        return res.json({ downloadUrl: `${req.protocol}://${req.get('host')}/api/download/${outputFilename}` });
    }

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    return res.status(400).json({ error: 'Unsupported format combination.' });
  } catch (error) {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    res.status(500).json({ error: 'File conversion failed.' });
  }
});

app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'converted', filename);
  if (fs.existsSync(filePath)) res.download(filePath, filename); 
  else res.status(404).send('File not found');
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));