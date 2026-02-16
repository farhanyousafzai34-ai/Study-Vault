import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Library, Star, Settings, Search, 
  Folder, Plus, Upload, LogOut, Zap, BookOpen, TrendingUp, MoreVertical, Download, Trash2,
  BarChart3, ChevronLeft, Grid, List, FileText, User, Bell, Shield, X, Eye
} from 'lucide-react';

// --- Interfaces ---
interface FileItem {
  id: string;
  name: string;
  type: string;
  content: string;
  subjectName: string;
  date: string;
  isFavorite?: boolean;
}

interface Activity {
  id: string;
  text: string;
  time: string;
}

const Dashboard: React.FC = () => {
  // --- State Management ---
  const [currentView, setCurrentView] = useState<'dashboard' | 'library' | 'favorites' | 'analytics' | 'settings'>('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [subjects, setSubjects] = useState<{name: string, color: string}[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectInput, setSubjectInput] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [subjectMenuId, setSubjectMenuId] = useState<string | null>(null);
  
  // Settings States (Persistent)
  const [userName, setUserName] = useState(() => localStorage.getItem('profileName') || 'Farhan');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || 'farhan@example.com');
  const [userPassword, setUserPassword] = useState(() => localStorage.getItem('userPassword') || '1234');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [darkMode, setDarkMode] = useState(false);

  // Auth (login/signup) UI state (controlled inputs)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const saveSettings = () => {
    localStorage.setItem('profileName', userName);
    localStorage.setItem('userEmail', userEmail);
    localStorage.setItem('userPassword', userPassword);
    alert('Settings Saved! Name and Login updated.');
  };

  const handleSignOut = () => {
    localStorage.setItem('isLoggedIn', 'false');
    setIsLoggedIn(false);
  };

  // Preview & Persistence States
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderColors = ['#2563eb', '#ea580c', '#16a34a', '#9333ea', '#db2777', '#06b6d4'];

  // --- Effects: Data Persistence ---
  useEffect(() => {
    const savedSubs = localStorage.getItem('sv_gold_subjects');
    const savedFiles = localStorage.getItem('sv_gold_files');
    const savedAct = localStorage.getItem('sv_gold_activity');
    
    if (savedSubs) setSubjects(JSON.parse(savedSubs));
    if (savedFiles) setFiles(JSON.parse(savedFiles));
    if (savedAct) setActivities(JSON.parse(savedAct));

    setIsLoaded(true);

    const closeMenu = () => {
        setActiveMenuId(null);
        setSubjectMenuId(null);
    };
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  useEffect(() => {
    if (isLoaded) {
        localStorage.setItem('sv_gold_subjects', JSON.stringify(subjects));
        localStorage.setItem('sv_gold_files', JSON.stringify(files));
        localStorage.setItem('sv_gold_activity', JSON.stringify(activities));
    }
  }, [subjects, files, activities, isLoaded]);

  // --- Logic Handlers ---
  const addActivity = (text: string) => {
    const newAct = { id: Date.now().toString(), text, time: 'Just now' };
    setActivities([newAct, ...activities].slice(0, 5));
  };

  const toggleFavorite = (id: string) => {
    setFiles(files.map(f => f.id === id ? { ...f, isFavorite: !f.isFavorite } : f));
    const file = files.find(f => f.id === id);
    if (file) addActivity(`${!file.isFavorite ? 'Added to' : 'Removed from'} favorites: ${file.name}`);
  };

  const addSubject = () => {
    const name = subjectInput.trim();
    if (name && !subjects.some(s => s.name === name)) {
      setSubjects([...subjects, { name, color: selectedColor }]);
      addActivity(`Created folder: ${name}`);
      setSubjectInput('');
    }
  };

  const deleteSubject = (name: string) => {
    setSubjects(subjects.filter(s => s.name !== name));
    setFiles(files.filter(f => f.subjectName !== name));
    addActivity(`Deleted folder: ${name}`);
    if (selectedSubject === name) setSelectedSubject(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        content: event.target?.result as string,
        subjectName: selectedSubject || (subjects[0]?.name || 'General'),
        date: new Date().toLocaleDateString(),
        isFavorite: false
      };
      setFiles([newFile, ...files]);
      addActivity(`Uploaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const deleteFile = (id: string, name: string) => {
    setFiles(files.filter(f => f.id !== id));
    addActivity(`Deleted: ${name}`);
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject ? f.subjectName === selectedSubject : true;
    return matchesSearch && matchesSubject;
  });

  const renderPreviewContent = () => {
    if (!previewFile) return null;
    if (previewFile.type.startsWith('image/')) {
        return <img src={previewFile.content} alt={previewFile.name} style={styles.previewImage} />;
    } else if (previewFile.type === 'application/pdf') {
        return <iframe src={previewFile.content} title={previewFile.name} style={styles.previewIframe} />;
    } else {
        return (
            <div style={styles.previewPlaceholder}>
                <FileText size={60} color="#cbd5e1" />
                <p>Preview not supported for this type.</p>
                <a href={previewFile.content} download={previewFile.name} style={styles.downloadLink}>Download to View</a>
            </div>
        );
    }
  };
  if (darkMode) console.log("Dark mode is enabled");
  if (activeMenuId) console.log("Menu active for:", activeMenuId);
  console.log(setDarkMode);

  // --- LOGIN / SIGNUP MODAL ---
  {!isLoggedIn && (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundImage:
        'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2070")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: '"Inter", sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}
  >
    <canvas
      id="particles"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    ></canvas>

    <div
      style={{
        width: '800px',
        maxWidth: '95%',
        height: '500px',
        borderRadius: '24px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
      }}
    >
      {/* Left Side */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'rgba(37, 99, 235, 0.85)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            backgroundColor: 'white',
            color: '#2563eb',
            fontWeight: '800',
            fontSize: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          S
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '15px' }}>Study Vault</h1>
        <p style={{ fontSize: '14px', lineHeight: '1.6', maxWidth: '200px' }}>
          Organise Subjects, Upload Notes, and keep every resource in one source, focused Workspace.
        </p>
      </div>

      {/* Right Side */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 50px',
        }}
      >
        {authMode === 'login' && (
          <>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '30px' }}>Sign in to your Account</p>

            <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px',
                width: '100%',
                outline: 'none',
                fontSize: '14px',
              }}
            />

            <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '25px',
                width: '100%',
                outline: 'none',
                fontSize: '14px',
              }}
            />

            <button
              onClick={() => {
                if (authEmail === userEmail && authPassword === userPassword) {
                  localStorage.setItem('isLoggedIn', 'true');
                  setIsLoggedIn(true);
                } else {
                  alert('Access Denied: Invalid Credentials');
                }
              }}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '20px',
              }}
            >
              Sign In
            </button>

            <p style={{ fontSize: '14px', textAlign: 'center', color: '#64748b' }}>
              New to Study Vault?{' '}
              <span
                onClick={() => setAuthMode('signup')}
                style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}
              >
                Create Account
              </span>
            </p>
          </>
        )}

        {/* Signup Modal */}
        {authMode === 'signup' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
              Create Your Account
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '20px' }}>Sign up with</p>

            <button
              onClick={() => alert('Google Sign Up coming soon')}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#db4437',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                marginBottom: '12px',
                cursor: 'pointer',
              }}
            >
              Continue with Google
            </button>

            <button
              onClick={() => alert('Facebook Sign Up coming soon')}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#4267B2',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                marginBottom: '20px',
                cursor: 'pointer',
              }}
            >
              Continue with Facebook
            </button>

            <p style={{ margin: '15px 0', fontWeight: '600', color: '#64748b' }}>Or Sign Up Manually</p>

            <input
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px',
                width: '100%',
                outline: 'none',
                fontSize: '14px',
              }}
            />

            <input
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '25px',
                width: '100%',
                outline: 'none',
                fontSize: '14px',
              }}
            />

            <button
              onClick={() => {
                setUserEmail(authEmail);
                setUserPassword(authPassword);
                localStorage.setItem('userEmail', authEmail);
                localStorage.setItem('userPassword', authPassword);
                localStorage.setItem('isLoggedIn', 'true');
                setIsLoggedIn(true);
                alert('Account Created Successfully!');
              }}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '20px',
              }}
            >
              Sign Up
            </button>

            <p style={{ fontSize: '14px', textAlign: 'center', color: '#64748b' }}>
              Already have an account?{' '}
              <span
                onClick={() => setAuthMode('login')}
                style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}
              >
                Sign In
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )}


          {currentView === 'favorites' && (
            <>
              <div style={styles.welcomeRow}>
                <div>
                  <h1 style={styles.welcomeTitle}>Favorites</h1>
                  <p style={{color: '#64748b', margin: 0}}>Quick access to your most important materials.</p>
                </div>
              </div>
              <div style={styles.filesContainer}>
                {files.filter(f => f.isFavorite).length === 0 ? (
                  <div style={styles.emptyFiles}>No favorites yet. Star a file to see it here!</div>
                ) : (
                  files.filter(f => f.isFavorite).map(f => (
                    <div key={f.id} style={styles.fileRow} onClick={() => setPreviewFile(f)}>
                      <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <div style={styles.fileIcon}>⭐</div>
                        <div>
                          <div style={{fontWeight:'700', fontSize:'14px'}}>{f.name}</div>
                          <div style={{fontSize:'12px', color:'#94a3b8'}}>{f.subjectName} • {f.date}</div>
                        </div>
                      </div>
                      <Star 
                        size={18} 
                        color="#f59e0b" 
                        fill="#f59e0b"
                        cursor="pointer"
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(f.id); }}
                      />
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {currentView === 'analytics' && (
            <>
              <div style={styles.welcomeRow}>
                <div>
                  <h1 style={styles.welcomeTitle}>Analytics</h1>
                  <p style={{color: '#64748b', margin: 0}}>Insights into your study habits and storage.</p>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px'}}>
                 <div style={styles.analyticsCard}>
                    <h3 style={{margin:'0 0 20px 0', fontSize:'16px'}}>Files per Subject</h3>
                    {subjects.map(s => (
                      <div key={s.name} style={{marginBottom:'15px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'5px'}}>
                          <span>{s.name}</span>
                          <span>{files.filter(f => f.subjectName === s.name).length} files</span>
                        </div>
                        <div style={{width:'100%', height:'8px', background:'#f1f5f9', borderRadius:'4px'}}>
                          <div style={{
                            width: `${(files.filter(f => f.subjectName === s.name).length / (files.length || 1)) * 100}%`,
                            height:'100%', background: s.color, borderRadius:'4px'
                          }} />
                        </div>
                      </div>
                    ))}
                 </div>
                 <div style={styles.analyticsCard}>
                    <h3 style={{margin:'0 0 20px 0', fontSize:'16px'}}>Storage Usage</h3>
                    <div style={{textAlign:'center', padding:'20px 0'}}>
                        <div style={{fontSize:'48px', fontWeight:'800', color:'#2563eb'}}>{(files.length * 0.2).toFixed(1)}MB</div>
                        <div style={{color:'#64748b', fontSize:'14px'}}>of 500MB used</div>
                    </div>
                 </div>
              </div>
            </>
          )}

          {currentView === 'settings' && (
            <>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Settings</h2>
              </div>
              
              <div style={styles.settingsGroup}>
                <div style={styles.settingsItem}>
                  <div style={{display:'flex', gap:'12px', alignItems:'center', width: '100%'}}>
                    <User size={20} color="#64748b" />
                    <div style={{flex: 1}}>
                      <div style={{fontWeight:'700'}}>Profile Name</div>
                      <input 
                        style={styles.settingsInput} 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.settingsItem}>
                  <div style={{display:'flex', gap:'12px', alignItems:'center', width: '100%'}}>
                    <FileText size={20} color="#64748b" />
                    <div style={{flex: 1}}>
                      <div style={{fontWeight:'700'}}>Email Address</div>
                      <input 
                        style={styles.settingsInput} 
                        type="email"
                        value={userEmail} 
                        onChange={(e) => setUserEmail(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.settingsItem}>
                  <div style={{display:'flex', gap:'12px', alignItems:'center', width: '100%'}}>
                    <Shield size={20} color="#64748b" />
                    <div style={{flex: 1}}>
                      <div style={{fontWeight:'700'}}>Password</div>
                      <input 
                        style={styles.settingsInput} 
                        type="password"
                        value={userPassword} 
                        onChange={(e) => setUserPassword(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                <div style={{padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9'}}>
                  <button 
                    onClick={saveSettings}
                    style={{
                      padding: '10px 24px', 
                      backgroundColor: '#2563eb', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '10px', 
                      fontWeight: '700', 
                      cursor: 'pointer'
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              <div style={styles.settingsGroup}>
                <div style={styles.settingsItem}>
                  <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                    <Bell size={20} color="#64748b"/> 
                    <span>Notifications</span>
                  </div>
                </div>
                <div style={styles.settingsItem}>
                  <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                    <Shield size={20} color="#64748b"/> 
                    <span>Privacy & Security</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <aside style={styles.insightsPanel}>
        <div style={styles.insightCard}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                <TrendingUp size={18} color="#2563eb" />
                <span style={{fontWeight:'700', fontSize:'14px'}}>Vault Stats</span>
            </div>
            <div style={styles.statRow}>
                <div><div style={styles.statVal}>{files.length}</div><div style={styles.statLabel}>Files</div></div>
                <div><div style={styles.statVal}>{subjects.length}</div><div style={styles.statLabel}>Folders</div></div>
            </div>
        </div>

        <div style={styles.streakCard}>
            <Zap size={20} color="#f59e0b" fill="#f59e0b" />
            <div>
              <div style={{fontWeight:'700', fontSize:'14px'}}>Study Streak</div>
                <div style={{fontSize:'11px', color:'#92400e'}}>Upload daily to keep it!</div>
            </div>
        </div>

        <div style={{marginTop: '10px'}}>
            <h3 style={styles.activityHeader}>LIVE ACTIVITY</h3>
            <div style={styles.timeline}>
                {activities.length === 0 && <span style={{fontSize:'12px', color:'#cbd5e1'}}>No recent actions.</span>}
                {activities.map(act => (
                    <div key={act.id} style={styles.timelineItem}>
                        <div style={styles.timelineDot} />
                        <div style={{fontSize:'12px', color:'#1e293b'}}>{act.text}</div>
                        <div style={styles.timelineTime}>{act.time}</div>
                    </div>
                ))}
            </div>
        </div>

        <div style={styles.proBanner}>
            <BookOpen size={20} color="white" />
            <div style={{color:'white', fontSize:'12px', fontWeight:'600'}}>Ready for exams?</div>
            <button style={styles.proBtn}>Generate AI Quiz</button>
        </div>
      </aside>
    </div>
  );
};

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  appContainer: { display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden', fontFamily: '"Inter", sans-serif' },
  sidebar: { width: '260px', backgroundColor: '#fff', borderRight: '1px solid #eef2f6', padding: '30px 20px', display: 'flex', flexDirection: 'column' },
  logoSection: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' },
  logoIcon: { width: '32px', height: '32px', backgroundColor: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' },
  logoText: { fontSize: '20px', fontWeight: '800', margin: 0, color: '#0f172a' },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  navLabel: { fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em', marginTop: '20px', marginBottom: '8px', paddingLeft: '12px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: '#64748b', fontWeight: '600', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' },
  navItemActive: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: '#2563eb', backgroundColor: '#eff6ff', fontWeight: '700', borderRadius: '10px', fontSize: '14px' },
  signOutBtn: { marginTop: 'auto', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', color: '#64748b', fontWeight: '600' },
  mainScroll: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' },
  header: { padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10 },
  searchContainer: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '10px 15px', borderRadius: '12px', maxWidth: '450px', border: '1px solid #eef2f6' },
  headerSearch: { border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%' },
  contentPadding: { padding: '40px' },
  welcomeRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  welcomeTitle: { fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 5px 0' },
  backBtn: { background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  uploadBtnMain: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' },
  sectionTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' },
  subjectGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' },
  subjectCard: { padding: '24px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #eef2f6', cursor: 'pointer', transition: 'transform 0.2s' },
  folderWrapper: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  subCardTitle: { fontSize: '16px', fontWeight: '700', margin: '0' },
  subCardFiles: { fontSize: '13px', color: '#94a3b8' },
  newSubjectCard: { border: '2px dashed #e2e8f0', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  colorPickerRow: { display: 'flex', gap: '8px', marginBottom: '15px' },
  colorDot: { width: '16px', height: '16px', borderRadius: '50%', cursor: 'pointer' },
  newSubInput: { border: 'none', borderBottom: '1px solid #e2e8f0', background: 'transparent', fontSize: '14px', outline: 'none', flex: 1, padding: '5px 0' },
  addBtn: { width: '20px', height: '20px', borderRadius: '16px', backgroundColor: '#2563eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 },
  filesContainer: { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #eef2f6' },
  fileRow: { padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor:'pointer', transition:'background 0.2s' },
  emptyFiles: { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
  fileIcon: { width: '36px', height: '36px', backgroundColor: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  menuPop: { position: 'absolute', right: 0, top: '30px', backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '150px' },
  menuItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', color: '#ef4444', fontSize: '13px', fontWeight: '700', cursor: 'pointer', borderRadius: '8px' },
  insightsPanel: { width: '300px', backgroundColor: '#f8fafc', borderLeft: '1px solid #eef2f6', padding: '30px 24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  insightCard: { padding: '20px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #eef2f6' },
  statRow: { display: 'flex', gap: '30px' },
  statVal: { fontSize: '24px', fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: '12px', color: '#64748b', fontWeight: '600' },
  streakCard: { padding: '15px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' },
  activityHeader: { fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '15px' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '18px' },
  timelineItem: { position: 'relative', paddingLeft: '18px' },
  timelineDot: { position: 'absolute', left: 0, top: '6px', width: '7px', height: '7px', backgroundColor: '#2563eb', borderRadius: '50%' },
  timelineTime: { fontSize: '10px', color: '#94a3b8', marginTop: '2px' },
  proBanner: { marginTop: 'auto', padding: '24px', backgroundColor: '#0f172a', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' },
  proBtn: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' },
  iconBtn: { padding: '12px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '12px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' },
  analyticsCard: { padding: '24px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #eef2f6' },
  settingsGroup: { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #eef2f6', overflow: 'hidden' },
  settingsItem: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  settingsInput: { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', fontSize: '14px', marginTop: '5px', outline: 'none' },
  modalOverlay: { position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', backgroundColor:'rgba(15,23,42,0.85)', zIndex: 1000, display:'flex', alignItems:'center', justifyContent:'center' },
  modalContent: { backgroundColor:'#fff', width:'85%', height:'85%', borderRadius:'24px', display:'flex', flexDirection:'column', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)' },
  modalHeader: { padding:'20px 25px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' },
  closeBtn: { background:'transparent', border:'none', cursor:'pointer', color:'#94a3b8' },
  modalBody: { flex: 1, padding:'20px', display:'flex', justifyContent:'center', overflow:'auto', backgroundColor:'#f8fafc' },
  previewImage: { maxWidth:'100%', maxHeight:'100%', objectFit:'contain', borderRadius:'8px' },
  previewIframe: { width:'100%', height:'100%', border:'none', borderRadius:'8px' },
  previewPlaceholder: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'20px', textAlign:'center' },
  downloadLink: { padding:'12px 24px', backgroundColor:'#2563eb', color:'#fff', borderRadius:'12px', textDecoration:'none', fontWeight:'700', fontSize:'14px' }
};

export default Dashboard;




