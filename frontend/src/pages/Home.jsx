import { Link } from "react-router-dom";
import "../styles/Home.css";
import {
  FaComments,
  FaBolt,
  FaShieldAlt,
  FaLightbulb,
  FaBrain,
  FaMagic,
} from "react-icons/fa";

function Home() {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h1 className="logo">EDEX</h1>
        <nav>
          <a href="#about" className="about-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ marginRight: "8px" }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            About
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h1>Let AI Simplify Your Studies</h1>
        <p>Your AI companion for smarter, faster, and deeper learning.</p>
        <Link to="/chat" className="get-started-btn">
          Get Started Free
        </Link>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <FaComments className="feature-icon" />
          <h3>Natural Conversations</h3>
          <p>
            Experience fluid, context-aware discussions that feel genuinely
            human.
          </p>
        </div>
        <div className="feature-card">
          <FaBolt className="feature-icon" />
          <h3>Lightning Fast</h3>
          <p>Get instant responses powered by cutting-edge AI technology.</p>
        </div>
        <div className="feature-card">
          <FaShieldAlt className="feature-icon" />
          <h3>Enterprise Security</h3>
          <p>Your data is protected with military-grade encryption.</p>
        </div>
        <div className="feature-card">
          <FaLightbulb className="feature-icon" />
          <h3>Creative Solutions</h3>
          <p>Unlock new possibilities with AI-powered creative thinking.</p>
        </div>
        <div className="feature-card">
          <FaBrain className="feature-icon" />
          <h3>Advanced Learning</h3>
          <p>Our AI continuously learns and adapts to your needs.</p>
        </div>
        <div className="feature-card">
          <FaMagic className="feature-icon" />
          <h3>Smart Automation</h3>
          <p>Streamline your workflow with intelligent automation.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
