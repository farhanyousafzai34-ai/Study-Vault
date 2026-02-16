import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AuthModal = ({ isOpen = true, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const signupUsernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      if (mode === 'login') {
        loginEmailRef.current?.focus();
      } else {
        signupUsernameRef.current?.focus();
      }
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [isOpen, mode]);

  if (!isOpen) {
    return null;
  }

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Login form submitted');
  };

  const handleSignupSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Sign up form submitted');
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login clicked');
  };

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div style={styles.card}>
        {onClose && (
          <button type="button" aria-label="Close auth modal" style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        )}

        <h2 id="auth-modal-title" style={styles.title}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={styles.form}>
            <label style={styles.label} htmlFor="login-email">
              Email
            </label>
            <input ref={loginEmailRef} id="login-email" type="email" required style={styles.input} placeholder="you@example.com" />

            <label style={styles.label} htmlFor="login-password">
              Password
            </label>
            <input id="login-password" type="password" required style={styles.input} placeholder="Enter your password" />

            <button type="submit" style={{ ...styles.primaryButton, ...styles.signInButton }}>
              Sign In
            </button>

            <button type="button" style={styles.linkButton} onClick={() => console.log('Forgot password clicked')}>
              Forgot Password?
            </button>

            <p style={styles.switchText}>
              Don&apos;t have an account?{' '}
              <button type="button" style={styles.linkButtonInline} onClick={() => setMode('signup')}>
                Create Account
              </button>
            </p>
          </form>
        ) : (
          <div>
            <div style={styles.socialGroup}>
              <button type="button" style={{ ...styles.socialButton, ...styles.googleButton }} onClick={handleGoogleLogin}>
                <GoogleIcon />
                Continue with Google
              </button>
              <button type="button" style={{ ...styles.socialButton, ...styles.facebookButton }} onClick={handleFacebookLogin}>
                <FacebookIcon />
                Continue with Facebook
              </button>
            </div>

            <div style={styles.separatorContainer}>
              <span style={styles.separatorLine} />
              <span style={styles.separatorText}>or</span>
              <span style={styles.separatorLine} />
            </div>

            <form onSubmit={handleSignupSubmit} style={styles.form}>
              <label style={styles.label} htmlFor="signup-username">
                Username
              </label>
              <input
                ref={signupUsernameRef}
                id="signup-username"
                type="text"
                required
                style={styles.input}
                placeholder="Choose a username"
              />

              <label style={styles.label} htmlFor="signup-email">
                Email
              </label>
              <input id="signup-email" type="email" required style={styles.input} placeholder="you@example.com" />

              <label style={styles.label} htmlFor="signup-password">
                Password
              </label>
              <input id="signup-password" type="password" required style={styles.input} placeholder="Create a password" />

              <label style={styles.label} htmlFor="signup-confirm-password">
                Confirm Password
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                required
                style={styles.input}
                placeholder="Confirm your password"
              />

              <button type="submit" style={{ ...styles.primaryButton, ...styles.signUpButton }}>
                Sign Up
              </button>

              <p style={styles.switchText}>
                Already have an account?{' '}
                <button type="button" style={styles.linkButtonInline} onClick={() => setMode('login')}>
                  Sign In
                </button>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M21.35 11.1H12v2.98h5.35c-.45 2.1-2.24 3.12-5.35 3.12a6.25 6.25 0 1 1 0-12.5c1.78 0 3.26.64 4.48 1.72l2.17-2.16A9.22 9.22 0 0 0 12 2a10 10 0 1 0 0 20c5.77 0 9.57-4.05 9.57-9.75 0-.66-.06-1.15-.22-1.65Z" fill="currentColor" />
  </svg>
);

const FacebookIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.98H7.9V12h2.54V9.8c0-2.5 1.5-3.9 3.77-3.9 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.25 0-1.64.78-1.64 1.58V12h2.8l-.45 2.9h-2.35v6.98A10 10 0 0 0 22 12Z" fill="currentColor" />
  </svg>
);

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at top left, rgba(56, 189, 248, 0.25), rgba(15, 23, 42, 0.78))',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    padding: '1rem',
    zIndex: 1000,
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 460,
    padding: '1.5rem',
    borderRadius: 22,
    border: '1px solid rgba(255, 255, 255, 0.24)',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
    boxShadow: '0 24px 50px rgba(0, 0, 0, 0.35)',
    color: '#f8fafc',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    border: 'none',
    background: 'transparent',
    color: '#f8fafc',
    fontSize: 24,
    lineHeight: 1,
    cursor: 'pointer',
  },
  title: {
    margin: '0 0 1.25rem',
    textAlign: 'center',
    fontSize: '1.65rem',
    fontWeight: 700,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 600,
    marginTop: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem 0.9rem',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.14)',
    color: '#fff',
    outline: 'none',
  },
  primaryButton: {
    marginTop: '0.75rem',
    width: '100%',
    border: 'none',
    borderRadius: 12,
    padding: '0.78rem 1rem',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  signInButton: {
    background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
  },
  signUpButton: {
    background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
  },
  socialGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.7rem',
    marginBottom: '1rem',
  },
  socialButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.55rem',
    border: 'none',
    borderRadius: 12,
    padding: '0.72rem 1rem',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  googleButton: {
    background: 'linear-gradient(90deg, #f97316, #ef4444)',
  },
  facebookButton: {
    background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
  },
  separatorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    marginBottom: '0.4rem',
  },
  separatorLine: {
    flex: 1,
    height: 1,
    background: 'rgba(255, 255, 255, 0.38)',
  },
  separatorText: {
    fontSize: '0.85rem',
    color: 'rgba(248, 250, 252, 0.85)',
  },
  linkButton: {
    alignSelf: 'flex-end',
    border: 'none',
    background: 'none',
    color: '#bae6fd',
    cursor: 'pointer',
    padding: 0,
    marginTop: '0.15rem',
    fontSize: '0.86rem',
  },
  linkButtonInline: {
    border: 'none',
    background: 'none',
    color: '#67e8f9',
    cursor: 'pointer',
    padding: 0,
    fontWeight: 700,
    fontSize: 'inherit',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '0.9rem',
    fontSize: '0.9rem',
    color: 'rgba(248, 250, 252, 0.9)',
  },
};

export default AuthModal;
