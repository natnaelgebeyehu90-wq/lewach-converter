import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode"; // 
import axios from 'axios';
import { UploadCloud, FileText, Video, Folder, Download, Copy, Check, RefreshCw, LogIn, UserPlus, Mail, ShieldAlert, Cpu } from 'lucide-react';
import './App.css';

// --- EXPANDED PAGE COMPONENTS ---

const Help = () => (
  <div className="glass-page-container expanded-page">
    <h2>Help & Support Center</h2>
    <p className="page-subtitle">Everything you need to get your files converted smoothly.</p>
    
    <div className="help-grid">
      <div className="help-card">
        <Cpu className="help-icon" size={32} />
        <h3>How to Convert a File</h3>
        <ol>
          <li>Drag and drop your file into the dashed box on the Converter page.</li>
          <li>Select your desired output format from the dropdown menu.</li>
          <li>Click "Convert File" and wait for the processing to finish.</li>
          <li>Click the secure download link to save your new file.</li>
        </ol>
      </div>

      <div className="help-card">
        <ShieldAlert className="help-icon" size={32} />
        <h3>Troubleshooting</h3>
        <ul>
          <li><strong>Stuck on processing?</strong> Check your internet connection or ensure the file isn't corrupted.</li>
          <li><strong>Format Not Supported?</strong> We currently support major image formats (PNG, JPG, WEBP), Audio/Video (MP3, AVI, WEBM), and ZIP archives.</li>
          <li><strong>OCR isn't working?</strong> Ensure your uploaded image has clear, high-contrast, and readable text.</li>
        </ul>
      </div>
    </div>

    <div className="contact-box">
      <h3>Still need help?</h3>
      <p><Mail size={16} /> Reach out to the developer directly at support@lewach.com</p>
    </div>
  </div>
);

const About = () => (
  <div className="glass-page-container expanded-page">
    <h2>About ለዋጭ (Lewach)</h2>
    
    <div className="about-content">
      <p>
        <strong>Lewach</strong> is a lightning-fast, secure, and modern file conversion platform designed to make everyday digital transformations effortless. Whether you are extracting text from a screenshot, optimizing images for the web, or converting media, Lewach handles it entirely in the cloud.
      </p>
      
      <div className="developer-spotlight">
        <h3>The Developer Ecosystem</h3>
        <p>
          Designed and developed by <strong>NatnaelG</strong>, a dedicated student and full-stack developer pushing the boundaries of modern web technologies. Lewach is part of a broader, growing ecosystem of smart utility applications built to solve real-world problems.
        </p>
        <p>
          This platform stands alongside other innovative projects in the portfolio, including <strong>ፎቶcraft</strong> (an advanced AI Image Generator) and <strong>መጫኛው</strong> (a streamlined Media Downloader), all built with a passion for clean UI and robust backend architecture.
        </p>
      </div>
    </div>
  </div>
);

const FAQ = () => (
  <div className="glass-page-container expanded-page">
    <h2>Frequently Asked Questions</h2>
    <div className="faq-list">
      <div className="faq-item">
        <strong>Are my files secure and private?</strong>
        <p>Absolutely. Your privacy is our top priority. Files are processed entirely in memory or temporary storage and are strictly deleted from our servers immediately after the conversion is complete. We do not store, view, or sell your data.</p>
      </div>
      <div className="faq-item">
        <strong>Is there a file size limit?</strong>
        <p>Currently, guest users can convert files up to 50MB. Creating a free account unlocks higher file size limits and faster processing queues.</p>
      </div>
      <div className="faq-item">
        <strong>What is the OCR feature?</strong>
        <p>Optical Character Recognition (OCR) is an AI-powered tool that scans an uploaded image (like a screenshot or a scanned document), reads the letters inside it, and outputs copyable text instantly.</p>
      </div>
      <div className="faq-item">
        <strong>Do I need to install any software?</strong>
        <p>No. Lewach is a 100% cloud-based web application. It works directly in your browser on Windows, Mac, Linux, iOS, and Android.</p>
      </div>
    </div>
  </div>
);

// --- AUTHENTICATION COMPONENTS ---

const Login = ({ setUser }) => {
  const navigate = useNavigate(); // Tool to redirect the user

  const handleGoogleSuccess = (credentialResponse) => {
    // 1. Decode the secure token from Google
    const decodedToken = jwtDecode(credentialResponse.credential);
    console.log("Welcome:", decodedToken.name);
    
    // 2. Save the user data to React state
    setUser(decodedToken);
    
    // 3. Immediately send the user back to the main converter page
    navigate('/'); 
  };

  return (
    <div className="glass-auth-container">
      <LogIn size={48} className="auth-icon" />
      <h2>Welcome Back</h2>
      <div className="social-auth-wrapper">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} theme="filled_black" shape="circle" size="large" />
      </div>
      <div className="auth-divider"><span>OR CONTINUE WITH EMAIL</span></div>
      <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Email Address" required />
        <input type="password" placeholder="Password" required />
        <button type="submit" className="premium-convert-btn auth-btn">Log In</button>
      </form>
      <p className="auth-switch">Don't have an account? <Link to="/signup">Sign up here</Link></p>
    </div>
  );
};

const Signup = ({ setUser }) => {
  const navigate = useNavigate();

  const handleGoogleSuccess = (credentialResponse) => {
    const decodedToken = jwtDecode(credentialResponse.credential);
    setUser(decodedToken);
    navigate('/'); 
  };

  return (
    <div className="glass-auth-container">
      <UserPlus size={48} className="auth-icon" />
      <h2>Create an Account</h2>
      <div className="social-auth-wrapper">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Signup Failed')} theme="filled_black" shape="circle" size="large" text="signup_with" />
      </div>
      <div className="auth-divider"><span>OR REGISTER WITH EMAIL</span></div>
      <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="Full Name" required />
        <input type="email" placeholder="Email Address" required />
        <input type="password" placeholder="Password" required />
        <button type="submit" className="premium-convert-btn auth-btn">Sign Up</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Log in here</Link></p>
    </div>
  );
};

// --- MAIN CONVERTER COMPONENT (Unchanged) ---
const ConverterApp = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(''); 
  const [targetFormat, setTargetFormat] = useState('');
  const [status, setStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      setExtractedText(''); setDownloadUrl(''); setStatus('');
      if (file.type.startsWith('image/')) { setFileType('image'); setTargetFormat('png'); } 
      else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) { setFileType('video'); setTargetFormat('mp3'); } 
      else if (['zip'].includes(ext)) { setFileType('archive'); setTargetFormat('zip'); } 
      else { setFileType('unknown'); }
    }
  }, [file]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length > 0) setFile(e.dataTransfer.files[0]); };
  const handleFileSelect = (e) => { if (e.target.files.length > 0) setFile(e.target.files[0]); };
  const handleCopyText = () => { navigator.clipboard.writeText(extractedText); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const getFileIcon = () => {
    if (fileType === 'image') return <UploadCloud size={40} className="glow-icon" />;
    if (fileType === 'video') return <Video size={40} className="glow-icon" />;
    if (fileType === 'archive') return <Folder size={40} className="glow-icon" />;
    return <UploadCloud size={40} className="glow-icon" />;
  };

  const handleUploadAndConvert = async () => {
    if (!file) return setStatus('Please select a file first.');
    if (fileType === 'unknown') return setStatus('File type not supported yet!');
    const formData = new FormData(); formData.append('file', file); formData.append('targetFormat', targetFormat); 
    try {
      setDownloadUrl(''); setExtractedText('');
      setStatus(targetFormat === 'txt' ? 'Scanning image for text... 🔍' : 'Converting your file... ⚙️');
      const response = await axios.post('https://lewach-converter.onrender.com/api/convert', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus('Success! Your file is ready.'); setDownloadUrl(response.data.downloadUrl);
      if (response.data.extractedText) setExtractedText(response.data.extractedText);
    } catch (error) {
      setStatus(error.response?.data?.error ? `Failed: ${error.response.data.error}` : 'Conversion failed due to a server error.');
    }
  };

  return (
    <main className="main-content">
      <header className="hero-section">
        <h2>Smart Universal File Converter</h2>
        <p>Transform images, media, archives, or instantly extract OCR text with one click.</p>
      </header>
      <section className="conversion-card">
        <div className={`glass-drop-zone ${isDragging ? 'drag-active' : ''} ${file ? 'has-file' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
          {getFileIcon()}
          {file ? (
            <div className="file-meta"><h3>{file.name}</h3><p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p></div>
          ) : (
            <div className="drop-prompt"><h3>Drag & drop your file here</h3><p>or click to browse locally</p></div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
        </div>
        {file && (
          <div className="glass-action-panel">
            <div className="dropdown-control">
              <label>Target Format</label>
              <div className="select-wrapper">
                {fileType === 'image' && ( <select value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)}> <option value="png">PNG (Lossless Image)</option> <option value="jpeg">JPG (Compressed)</option> <option value="webp">WEBP (Web Optimized)</option> <option value="pdf">PDF (Document)</option> <option value="txt">TXT (OCR Text)</option> </select> )}
                {fileType === 'video' && ( <select value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)}> <option value="mp3">MP3 (Audio extract)</option> <option value="avi">AVI Video</option> <option value="webm">WEBM Video</option> </select> )}
                {fileType === 'archive' && ( <select value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)}> <option value="zip">ZIP Archive</option> </select> )}
                {fileType === 'unknown' && <span className="error-text">Format Not Supported</span>}
              </div>
            </div>
            <button className="premium-convert-btn" onClick={handleUploadAndConvert}><RefreshCw size={18} className={status.includes('... ') ? 'spin' : ''} /> Convert File</button>
          </div>
        )}
        {status && <div className={`notification-banner ${status.includes('Failed') ? 'banner-error' : 'banner-info'}`}><p>{status}</p></div>}
        {extractedText && ( <div className="glass-ocr-box"><div className="ocr-topbar"><span>Scanned Result Preview</span><button className="glass-copy-btn" onClick={handleCopyText}>{copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button></div><textarea readOnly value={extractedText} className="premium-textarea" /></div> )}
        {downloadUrl && ( <div className="download-wrapper-box"><a href={downloadUrl} className="premium-download-btn"><Download size={18} /> Download Finished File</a></div> )}
      </section>
    </main>
  );
};

// --- APP WRAPPER WITH ROUTING & GOOGLE AUTH PROVIDER ---
// We need to create an inner component to use "useNavigate" because it must be inside a <Router>
const AppContent = () => {
  const [user, setUser] = useState(null); // This holds your profile data!

  return (
    <div className="dashboard-container">
      <div className="blob blob-blue"></div>
      <div className="blob blob-green"></div>

      <nav className="glass-navbar">
        <Link to="/" className="brand-link" style={{ textDecoration: 'none' }}>
          <div className="brand-wrapper">
            <img src="/logo.png" alt="Lewach Logo" className="brand-logo-img" />
            <span className="brand-logo-text">ለዋጭ (LEWACH)</span>
          </div>
        </Link>
        
        <div className="glass-nav-links">
          <Link to="/">Converter</Link>
          <Link to="/about">About</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/help">Help</Link>
        </div>

        <div className="auth-nav-links">
          {/* IF USER IS LOGGED IN: Show Profile. OTHERWISE: Show Login/Signup */}
          {user ? (
            <div className="user-profile-nav">
              <img src={user.picture} alt="Profile" className="nav-profile-pic" referrerPolicy="no-referrer" />
              <span className="nav-profile-name">{user.given_name}</span>
              <button onClick={() => setUser(null)} className="glass-logout-btn">Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/signup" className="signup-link">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <div className="content-wrapper">
        <Routes>
          <Route path="/" element={<ConverterApp />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help" element={<Help />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
        </Routes>
      </div>

      <footer className="glass-footer">
        <p>© {new Date().getFullYear()} NatnaelG. All rights reserved.</p>
        <p className="footer-sub">Built with passion for seamless file conversion.</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    // YOU MUST REPLACE THIS STRING WITH YOUR ACTUAL GOOGLE CLIENT ID
    <GoogleOAuthProvider clientId="303202417472-7itb2istudqt1qvu1m0fp3ji2k7m3ki2.apps.googleusercontent.com">
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;