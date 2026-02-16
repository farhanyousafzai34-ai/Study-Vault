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
  if (!isLoggedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        width: '100vw',
        backgroundImage: 'url("https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2070")', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: '"Inter", sans-serif' 
      }}>
        {/* Glassmorphism Card */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          padding: '60px 40px', 
          borderRadius: '24px', 
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)', 
          width: '400px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '25px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{ color: 'white', fontSize: '42px', marginBottom: '10px', fontWeight: '700', letterSpacing: '-1px' }}>Login</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input 
              style={{ 
                padding: '16px', 
                borderRadius: '12px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                color: 'white', 
                outline: 'none',
                fontSize: '15px'
              }} 
              placeholder="Username or Email" 
              id="loginEmail" 
            />
            <input 
              style={{ 
                padding: '16px', 
                borderRadius: '12px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                color: 'white', 
                outline: 'none',
                fontSize: '15px'
              }} 
              type="password" 
              placeholder="Password" 
              id="loginPass" 
            />
          </div>

          <button 
            style={{ 
              padding: '16px', 
              backgroundColor: '#9333ea', // Deep Purple
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: '700', 
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4)'
            }}
            onClick={() => {
              const e = (document.getElementById('loginEmail') as HTMLInputElement).value;
              const p = (document.getElementById('loginPass') as HTMLInputElement).value;
              // Checks against your settings variables
              if (e === userEmail && p === userPassword) {
                localStorage.setItem('isLoggedIn', 'true');
                setIsLoggedIn(true);
              } else {
                alert('Access Denied: Invalid Credentials');
              }
            }}
          >
            Sign In
          </button>

          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginTop: '10px' }}>
            New here? <span style={{ color: 'white', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>Create Account</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />

      {/* --- PREVIEW MODAL --- */}
      {previewFile && (
        <div style={styles.modalOverlay} onClick={() => setPreviewFile(null)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <FileText size={20} color="#2563eb" />
                        <span style={{fontWeight:'700', color:'#1e293b'}}>{previewFile.name}</span>
                    </div>
                    <button style={styles.closeBtn} onClick={() => setPreviewFile(null)}><X size={20}/></button>
                </div>
                <div style={styles.modalBody}>
                    {renderPreviewContent()}
                </div>
            </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>S</div>
          <h2 style={styles.logoText}>StudyVault</h2>
        </div>
        
        <nav style={styles.nav}>
          <div style={styles.navLabel}>MAIN MENU</div>
          <div style={currentView === 'dashboard' ? styles.navItemActive : styles.navItem} onClick={() => setCurrentView('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </div>
          <div style={currentView === 'library' ? styles.navItemActive : styles.navItem} onClick={() => setCurrentView('library')}>
            <Library size={18} /> My Library
          </div>
          
          <div style={styles.navLabel}>PERSONAL</div>
          <div style={currentView === 'favorites' ? styles.navItemActive : styles.navItem} onClick={() => setCurrentView('favorites')}>
            <Star size={18} /> Favorites
          </div>
          <div style={currentView === 'analytics' ? styles.navItemActive : styles.navItem} onClick={() => setCurrentView('analytics')}>
            <BarChart3 size={18} /> Analytics
          </div>
          <div style={currentView === 'settings' ? styles.navItemActive : styles.navItem} onClick={() => setCurrentView('settings')}>
            <Settings size={18} /> Settings
          </div>
        </nav>

        <button onClick={handleSignOut} style={styles.signOutBtn}><LogOut size={16} /> Sign Out</button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main style={styles.mainScroll}>
        <header style={styles.header}>
          <div style={styles.searchContainer}>
            <Search size={18} color="#94a3b8" />
            <input 
                placeholder="Search handouts, notes, or topics..." 
                style={styles.headerSearch} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div style={styles.contentPadding}>
          {currentView === 'dashboard' && (
            <>
              <div style={styles.welcomeRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {selectedSubject && (
                        <button onClick={() => setSelectedSubject(null)} style={styles.backBtn}>
                            <ChevronLeft size={20} color="#64748b" />
                        </button>
                    )}
                    <div>
                        <h1 style={styles.welcomeTitle}>
                            {selectedSubject ? selectedSubject : `Welcome back, ${userName}`}
                        </h1>
                        <p style={{color: '#64748b', margin: 0}}>
                            {selectedSubject ? `Managing files in ${selectedSubject}` : "Here's what's happening with your study materials."}
                        </p>
                    </div>
                </div>
                <button style={styles.uploadBtnMain} onClick={() => fileInputRef.current?.click()}>
                    <Upload size={18} /> {selectedSubject ? 'Upload to Folder' : 'Upload New'}
                </button>
              </div>
              
              {!selectedSubject && (
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={styles.sectionTitle}>Your Subjects</h2>
                    <div style={styles.subjectGrid}>
                    {subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((sub, i) => (
                        <div key={i} style={styles.subjectCard} onClick={() => setSelectedSubject(sub.name)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ ...styles.folderWrapper, backgroundColor: sub.color }}>
                                <Folder size={20} fill="white" color="white" />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <MoreVertical 
                                    size={18} 
                                    color="#94a3b8" 
                                    cursor="pointer" 
                                    onClick={(e) => { e.stopPropagation(); setSubjectMenuId(sub.name); }} 
                                />
                                {subjectMenuId === sub.name && (
                                    <div style={styles.menuPop}>
                                        <div style={styles.menuItem} onClick={(e) => { e.stopPropagation(); deleteSubject(sub.name); }}>
                                            <Trash2 size={14} /> Delete Folder
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <h3 style={styles.subCardTitle}>{sub.name}</h3>
                        <p style={styles.subCardFiles}>{files.filter(f => f.subjectName === sub.name).length} files</p>
                        </div>
                    ))}

                    <div style={styles.newSubjectCard} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.colorPickerRow}>
                        {folderColors.map(c => (
                            <div 
                                key={c} 
                                onClick={() => setSelectedColor(c)} 
                                style={{...styles.colorDot, backgroundColor: c, border: selectedColor === c ? '2px solid #000' : 'none' }} 
                            />
                        ))}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                        <input 
                            style={styles.newSubInput} 
                            placeholder="New Subject..." 
                            value={subjectInput} 
                            onChange={(e) => setSubjectInput(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                        />
                        <button onClick={(e) => { e.stopPropagation(); addSubject(); }} style={styles.addBtn}>
                          <Plus size={28} strokeWidth={3.5} color="white" />
                        </button>
                        </div>
                    </div>
                    </div>
                </section>
              )}

              <section>
                <h2 style={styles.sectionTitle}>{selectedSubject ? "Folder Contents" : "Recent Materials"}</h2>
                <div style={styles.filesContainer}>
                    {filteredFiles.length === 0 ? (
                        <div style={styles.emptyFiles}>Vault is empty.</div>
                    ) : (
                    filteredFiles.map(f => (
                        <div key={f.id} style={styles.fileRow} onClick={() => setPreviewFile(f)}>
                            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                <div style={styles.fileIcon}>{f.type.startsWith('image/') ? '🖼️' : '📄'}</div>
                                <div>
                                    <div style={{fontWeight:'700', fontSize:'14px'}}>{f.name}</div>
                                    <div style={{fontSize:'12px', color:'#94a3b8'}}>{f.subjectName} • {f.date}</div>
                                </div>
                            </div>
                            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                                <Eye size={18} color="#94a3b8" />
                                <Star 
                                  size={18} 
                                  color={f.isFavorite ? "#f59e0b" : "#cbd5e1"} 
                                  fill={f.isFavorite ? "#f59e0b" : "transparent"}
                                  cursor="pointer"
                                  onClick={(e) => { e.stopPropagation(); toggleFavorite(f.id); }}
                                />
                                <MoreVertical size={18} color="#94a3b8" cursor="pointer" onClick={(e) => { e.stopPropagation(); setActiveMenuId(f.id); }} />
                            </div>
                        </div>
                    )))}
                </div>
              </section>
            </>
          )}

          {currentView === 'library' && (
            <>
              <div style={styles.welcomeRow}>
                <div>
                  <h1 style={styles.welcomeTitle}>My Library</h1>
                  <p style={{color: '#64748b', margin: 0}}>Browse and manage your entire study collection.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={styles.iconBtn} onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                    {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
                  </button>
                  <button style={styles.uploadBtnMain} onClick={() => fileInputRef.current?.click()}>
                    <Plus size={18} /> Add New File
                  </button>
                </div>
              </div>

              <div style={styles.filesContainer}>
                {files.length === 0 ? (
                  <div style={styles.emptyFiles}>Your library is empty.</div>
                ) : (
                  files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                    <div key={f.id} style={styles.fileRow} onClick={() => setPreviewFile(f)}>
                      <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <div style={styles.fileIcon}><FileText size={18} color="#2563eb" /></div>
                        <div>
                          <div style={{fontWeight:'700', fontSize:'14px'}}>{f.name}</div>
                          <div style={{fontSize:'12px', color:'#94a3b8'}}>{f.subjectName} • {f.date}</div>
                        </div>
                      </div>
                      <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                        <Star 
                          size={18} 
                          color={f.isFavorite ? "#f59e0b" : "#cbd5e1"} 
                          fill={f.isFavorite ? "#f59e0b" : "transparent"}
                          cursor="pointer"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(f.id); }}
                        />
                        <Download size={18} color="#94a3b8" cursor="pointer" />
                        <Trash2 size={18} color="#ef4444" cursor="pointer" onClick={(e) => { e.stopPropagation(); deleteFile(f.id, f.name); }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
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
