
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex flex-col items-center md:items-start mb-4">
              <span className="text-xl font-bold text-primary">
                xStreet
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              The premier marketplace for XRP enthusiasts, where all transactions happen in XRP, 
              and prices are determined by transparent market forces.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-primary">Learn</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  What is XRP?
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  How pricing works
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Setting up a wallet
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  XRP Basics
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-primary">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} xStreet. All rights reserved.</p>
          <p className="mt-1">Powered by XRP.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
