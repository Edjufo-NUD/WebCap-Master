import React from 'react';
import { Users, Heart, Star, Globe, Music, Book, MapPin } from 'lucide-react';
import Navbar from '../Components/Navbar';
import './About.css';
import edrian from '../assets/edrian.jpeg';
import anji from '../assets/anji.jpeg';
import matthew from '../assets/matthew.jpg';

const About = () => {
  const teamMembers = [
    {
      name: "Edrian Formilleza",
      role: "Project Manager / Lead Developer",
      description: "Leads the technical development of FLIPino, ensuring a smooth user experience across web and mobile platforms.",
      image: edrian
    },
    {
      name: "Femie Estepa",
      role: "UI/UX Designer & Documentation Lead",
      description: "Designs intuitive and culturally-inspired interfaces, balancing functionality with the aesthetics of Filipino traditions.",
      image: anji
    },
    {
      name: "Matthew Faner",
      role: "Front-End Developer",
      description: "Responsible for implementing the visual elements of the system, making sure the user interface is functional, responsive, and user-friendly.",
      image: matthew
    }
  ];

  const features = [
    {
      icon: Music,
      title: "Dance Tutorials",
      description: "Step-by-step guidance through traditional Filipino folk dances"
    },
    {
      icon: Book,
      title: "Cultural Stories & History",
      description: "Rich narratives and historical context behind each dance tradition"
    },
    {
      icon: MapPin,
      title: "Regional Variations",
      description: "Explore diverse interpretations across different Filipino regions"
    }
  ];

  return (
    <div className="about-page-fullscreen">
      <Navbar />
      <div className="about-content">
        {/* Hero Section with integrated features */}
        <section className="about-hero">
          <div className="about-hero-content">
            <h1 className="about-title">About FLIPino</h1>
            <p className="about-subtitle">
              Preserving and celebrating the rich cultural heritage of the Philippines through digital storytelling
            </p>
            
            {/* Features content moved here */}
            <div className="hero-features-content">
              <p className="hero-features-description">
                FLIPino serves as a digital sanctuary for Filipino folk dances, from the graceful movements of 
                traditional celebrations to the passionate rhythms of ceremonial dances. We capture not just the steps and music, but the stories, emotions, 
                and cultural wisdom embedded in every dance.
              </p>
              
              <div className="hero-features-grid">
                {features.map((feature, index) => (
                  <div key={index} className="hero-feature-card">
                    <div className="hero-feature-header">
                      <div className="hero-feature-icon">
                        <feature.icon size={24} />
                      </div>
                      <h3 className="hero-feature-title">{feature.title}</h3>
                    </div>
                    <p className="hero-feature-description">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="about-hero-decoration">
            <div className="cultural-pattern"></div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="about-mission">
          <div className="container">
            <div className="mission-content">
              <h2>Our Mission</h2>
              <p>
                FLIPino is dedicated to preserving, documenting, and sharing the vibrant folk dances and cultural 
                traditions of the Philippines. We believe that culture is the heartbeat of a nation, and through 
                technology, we can ensure these precious traditions are passed down to future generations.
              </p>
              <p>
                Our platform serves as a digital repository where Filipino culture comes alive through interactive 
                experiences, detailed documentation, and immersive storytelling that connects people to their roots 
                and introduces the world to the beauty of Filipino heritage.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-team">
          <div className="container">
            <h2 className="section-title">Meet Our Team</h2>
            <p className="section-subtitle">
              Passionate individuals dedicated to preserving Filipino cultural heritage
            </p>
            
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-card">
                  <div className="team-image">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=8B5CF6&color=fff&size=200`;
                      }}
                    />
                  </div>
                  <div className="team-info">
                    <h3 className="team-name">{member.name}</h3>
                    <p className="team-role">{member.role}</p>
                    <p className="team-description">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-values">
          <div className="container">
            <h2 className="section-title">Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">
                  <Heart size={32} />
                </div>
                <h3>Cultural Respect</h3>
                <p>We approach every tradition with deep respect and authenticity, ensuring accurate representation of Filipino culture.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <Users size={32} />
                </div>
                <h3>Community</h3>
                <p>Building bridges between generations and communities to keep our cultural traditions alive and thriving.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <Globe size={32} />
                </div>
                <h3>Accessibility</h3>
                <p>Making Filipino culture accessible to everyone, everywhere, through innovative digital experiences.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <Star size={32} />
                </div>
                <h3>Excellence</h3>
                <p>Committed to delivering high-quality content and experiences that honor our rich cultural heritage.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="about-contact">
          <div className="container">
            <div className="contact-content">
              <h2>Get In Touch</h2>
              <p>
                Have questions about Filipino culture or want to contribute to our mission? 
                We'd love to hear from you!
              </p>
              <div className="contact-info">
                <p>Email: hello@flipino.ph</p>
                <p>Follow us on social media to stay updated on our latest cultural discoveries</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;