import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, signOut, currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const handleMenuToggle = () => {
    setMobileMenuOpen((open) => !open);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          Finance Ledger
        </Link>
        <button
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="menu-btn"
          onClick={handleMenuToggle}
          type="button"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className="nav-links">
          {token ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/records">Records</NavLink>
              {currentUser?.role === 'ADMIN' ? <NavLink to="/users">Users</NavLink> : null}
              <button className="nav-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </>
          )}
        </nav>
      </div>
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        {token ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/records">Records</NavLink>
            {currentUser?.role === 'ADMIN' ? <NavLink to="/users">Users</NavLink> : null}
            <button className="nav-logout-btn mobile-logout-btn" onClick={handleLogout} type="button">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup">Signup</NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
