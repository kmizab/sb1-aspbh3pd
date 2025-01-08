import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Menu, X, Phone, Mail, Building2, Users2, Brain, BarChart3, ArrowRight } from 'lucide-react';
import { supabase } from './lib/supabase';
import { EmployeePortal } from './components/EmployeePortal';
import { Auth } from './components/Auth';

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.log('Error:', error.message);
  }

  return (
    <Router>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-lg fixed w-full z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-20">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-2xl font-bold text-gray-800">RTIMS CONSULTING</span>
              </div>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-600 hover:text-blue-600">Accueil</Link>
                <Link to="/services" className="text-gray-600 hover:text-blue-600">Services</Link>
                <Link to="/expertise" className="text-gray-600 hover:text-blue-600">Expertise</Link>
                <Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
                <Link to="/employee" className="text-gray-600 hover:text-blue-600">
                  Espace Employé {session && '(Connecté)'}
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link to="/" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Accueil</Link>
                <Link to="/services" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Services</Link>
                <Link to="/expertise" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Expertise</Link>
                <Link to="/contact" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Contact</Link>
                <Link to="/employee" className="block px-3 py-2 text-gray-600 hover:text-blue-600">
                  Espace Employé {session && '(Connecté)'}
                </Link>
              </div>
            </div>
          )}
        </nav>

        <div className="pt-20">
          <Routes>
            <Route path="/employee" element={
              session ? <EmployeePortal session={session} onSignOut={signOut} /> : <Auth />
            } />
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/expertise" element={<ExpertisePage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// Pages publiques
function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">RTIMS CONSULTING</h1>
      {/* Contenu de la page d'accueil */}
    </div>
  );
}

function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Nos Services</h1>
      {/* Contenu de la page services */}
    </div>
  );
}

function ExpertisePage() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Notre Expertise</h1>
      {/* Contenu de la page expertise */}
    </div>
  );
}

function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact</h1>
      {/* Contenu de la page contact */}
    </div>
  );
}

export default App;