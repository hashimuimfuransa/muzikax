"use client";

import { useState } from "react";
import Link from "next/link";

export default function AboutUs() {
  const [activeTab, setActiveTab] = useState("mission");

  const teamMembers = [
    {
      name: "Tuyizere Dieudonne",
      role: "Co_Founder & CEO",
      bio: "Passionate about Rwandan music and technology, bringing artists and fans together through innovative digital solutions.",
      image: "/placeholder-ceo.jpg",
      social: { twitter: "#", linkedin: "#" }
    },
    {
      name: "Mugisha Jean Pierre",
      role: "Co_Founder & Head of Artist Relations",
      bio: " music artist with deep connections in Rwanda's music industry, helping artists thrive on digital platforms.",
      image: "/placeholder-team.jpg",
      social: { twitter: "#", linkedin: "#" }
    },
  
  ];

  const milestones = [
 
    {
       year: "2023",
      title: "Platform Launch",
      description: "MuzikaX officially launched, connecting Rwandan artists with global audiences"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#FF4D67] to-[#FFCB2B] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About MuzikaX</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Connecting Rwandan Music Creators with Fans Worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Mission & Vision Tabs */}
        <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-8 mb-16 border border-gray-700">
          <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-700">
            <button
              onClick={() => setActiveTab("mission")}
              className={`px-6 py-3 font-medium rounded-t-lg transition-all ${
                activeTab === "mission"
                  ? "bg-[#FF4D67] text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              Our Mission
            </button>
            <button
              onClick={() => setActiveTab("vision")}
              className={`px-6 py-3 font-medium rounded-t-lg transition-all ${
                activeTab === "vision"
                  ? "bg-[#FF4D67] text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              Our Vision
            </button>
            <button
              onClick={() => setActiveTab("values")}
              className={`px-6 py-3 font-medium rounded-t-lg transition-all ${
                activeTab === "values"
                  ? "bg-[#FF4D67] text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              Core Values
            </button>
          </div>

          <div className="min-h-[200px]">
            {activeTab === "mission" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-[#FF4D67]">Our Mission</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  To empower Rwandan and African music creators by providing them with a world-class digital platform that connects them directly with fans globally, while preserving and promoting the rich musical heritage of Rwanda and Africa.
                </p>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-gray-700/30 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-white">Artist Empowerment</h3>
                    <p className="text-gray-300">Providing tools and opportunities for Rwandan and African artists to showcase their talent and build sustainable careers.</p>
                  </div>
                  <div className="bg-gray-700/30 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-white">Cultural Preservation</h3>
                    <p className="text-gray-300">Celebrating and preserving Rwanda's and Africa's diverse musical traditions while fostering innovation.</p>
                  </div>
                  <div className="bg-gray-700/30 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-white">Global Reach</h3>
                    <p className="text-gray-300">Breaking geographical barriers to bring Rwandan and African music to audiences worldwide.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "vision" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-[#FF4D67]">Our Vision</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  To become Africa's leading music platform that champions local artists while building bridges between African music and the global community, creating economic opportunities and cultural exchange.
                </p>
                <div className="mt-8 p-6 bg-gradient-to-r from-[#FF4D67]/20 to-[#FFCB2B]/20 rounded-lg border border-[#FF4D67]/30">
                  <h3 className="text-xl font-semibold mb-3 text-white">Long-term Goals</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Establish MuzikaX as the premier destination for African music discovery</li>
                    <li>• Support 10,000+ African artists in building sustainable music careers</li>
                    <li>• Create meaningful economic impact for music communities across Africa</li>
                    <li>• Foster cross-cultural collaboration and musical innovation</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "values" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-[#FF4D67]">Core Values</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/30 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-white">Artist First</h3>
                    <p className="text-gray-300">We prioritize the needs and success of music creators above all else.</p>
                  </div>
                  <div className="bg-gray-700/30 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-white">Cultural Authenticity</h3>
                    <p className="text-gray-300">We celebrate genuine artistic expression and cultural diversity.</p>
                  </div>
                  <div className="bg-gray-700/30 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-white">Innovation</h3>
                    <p className="text-gray-300">We continuously evolve to meet the changing needs of artists and fans.</p>
                  </div>
                  <div className="bg-gray-700/30 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-white">Community</h3>
                    <p className="text-gray-300">We build meaningful connections between artists, fans, and culture.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#FF4D67]">Our Story</h2>
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                MuzikaX was born from a simple observation: Rwandan music deserved a dedicated platform that truly understood and celebrated its artists. In 2023, our founder Jean-Pierre Uwimana noticed that while Rwanda had incredible musical talent, there was no centralized digital ecosystem specifically designed for Rwandan artists to reach both local and international audiences.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Starting as a small team passionate about music technology, we set out to create more than just another streaming platform. We wanted to build a community—a digital home where Rwandan music creators could thrive, connect with fans, and share their stories with the world.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Today, MuzikaX represents the intersection of technology, artistry, and cultural preservation. We're proud to support hundreds of artists in sharing their music globally while staying true to our mission of empowering creators and celebrating Rwandan musical heritage.
              </p>
            </div>
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#FF4D67]">Our Journey</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#FF4D67] to-[#FFCB2B]"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                      <span className="inline-block px-3 py-1 bg-[#FF4D67] text-white text-sm font-medium rounded-full mb-3">
                        {milestone.year}
                      </span>
                      <h3 className="text-xl font-bold mb-2 text-white">{milestone.title}</h3>
                      <p className="text-gray-300">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Center dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[#FF4D67] rounded-full border-4 border-gray-900 z-10"></div>
                  
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pl-8' : 'pr-8'}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#FF4D67]">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700 text-center hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-24 h-24 bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{member.name}</h3>
                <p className="text-[#FF4D67] font-medium mb-3">{member.role}</p>
                <p className="text-gray-300 text-sm mb-4">{member.bio}</p>
                <div className="flex justify-center space-x-4">
                  <a href={member.social.twitter} className="text-gray-400 hover:text-[#FF4D67] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href={member.social.linkedin} className="text-gray-400 hover:text-[#FF4D67] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-[#FF4D67]/10 to-[#FFCB2B]/10 rounded-xl p-8 border border-[#FF4D67]/20">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#FF4D67]">By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#FF4D67] mb-2">50K+</div>
              <div className="text-gray-300">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#FF4D67] mb-2">200+</div>
              <div className="text-gray-300">Partner Artists</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#FF4D67] mb-2">1M+</div>
              <div className="text-gray-300">Streams Monthly</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#FF4D67] mb-2">15+</div>
              <div className="text-gray-300">Countries Reached</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}