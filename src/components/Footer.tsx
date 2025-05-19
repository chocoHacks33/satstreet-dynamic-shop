
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-satstreet-medium border-t border-satstreet-light mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex flex-col items-center md:items-start mb-4">
              <img 
                src="https://wacicyiidaysfjdiaeim.supabase.co/storage/v1/object/public/product-images-2//satstreet_logo_vector.svg" 
                alt="SatStreet" 
                className="h-10 w-auto mb-3"
              />
              <span className="text-xl font-bold bg-clip-text text-transparent bitcoin-gradient">
                SatStreet
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              The premier marketplace for Bitcoin enthusiasts, where all transactions happen in sats, 
              and prices are determined by transparent market forces.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-bitcoin">Learn</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-bitcoin transition-colors">
                  What are sats?
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-bitcoin transition-colors">
                  How pricing works
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-bitcoin transition-colors">
                  Setting up a wallet
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-bitcoin transition-colors">
                  Bitcoin Basics
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-bitcoin">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-bitcoin transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-bitcoin transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-bitcoin transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-bitcoin transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-satstreet-light text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SatStreet. All rights reserved.</p>
          <p className="mt-1">Powered by Bitcoin.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
