'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Mail, Linkedin, ExternalLink, BarChart3, Database, Search, TrendingDown, Menu, X, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Toast component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  )
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)

  // Check if email already exists in database
  const isEmailDuplicate = async (emailToCheck: string) => {
    const normalizedEmail = emailToCheck.toLowerCase()

    try {
      const { data, error } = await supabase
        .from('graveyard_api_signups')
        .select('email')
        .eq('email', normalizedEmail)
        .limit(1)

      if (error) {
        console.error('Error checking database for duplicate:', error)
        throw error // Let the main function handle the error
      }

      return data && data.length > 0
    } catch (error) {
      console.error('Error checking database for duplicate:', error)
      
      // Fallback to localStorage
      try {
        const emails = localStorage.getItem('graveyard_api_emails')
        const existingEmails = emails ? JSON.parse(emails) : []
        return existingEmails.includes(normalizedEmail)
      } catch (localStorageError) {
        console.error('Error checking localStorage fallback:', localStorageError)
        return false
      }
    }
  }

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setToast({ message: 'Please enter a valid email address', type: 'error' })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setToast({ message: 'Please enter a valid email address', type: 'error' })
      return
    }

    try {
      // Check for duplicate in database
      setIsCheckingDuplicate(true)
      const duplicate = await isEmailDuplicate(email)
      setIsCheckingDuplicate(false)

      if (duplicate) {
        setToast({ message: 'This email is already registered', type: 'error' })
        return
      }

      // Save to Supabase database
      const { error } = await supabase
        .from('graveyard_api_signups')
        .insert([
          {
            email: email.toLowerCase(),
            project_name: 'graveyard-api'
          }
        ])

      if (error) {
        console.error('Error saving email to database:', error)
        
        // Fallback to localStorage
        try {
          const emails = localStorage.getItem('graveyard_api_emails')
          const existingEmails = emails ? JSON.parse(emails) : []
          const updatedEmails = [...existingEmails, email.toLowerCase()]
          localStorage.setItem('graveyard_api_emails', JSON.stringify(updatedEmails))
          
          setSubmitted(true)
          setEmail('')
          setToast({ message: 'Successfully registered!', type: 'success' })
          setTimeout(() => setSubmitted(false), 3000)
        } catch (localStorageError) {
          console.error('Error saving to localStorage fallback:', localStorageError)
          setToast({ message: 'Failed to register email. Please try again.', type: 'error' })
        }
        return
      }

      setSubmitted(true)
      setEmail('')
      setToast({ message: 'Successfully registered!', type: 'success' })
      setTimeout(() => setSubmitted(false), 3000)

    } catch (error) {
      console.error('Unexpected error:', error)
      setIsCheckingDuplicate(false)
      setToast({ message: 'Registration failed. Please try again.', type: 'error' })
    }
  }

  // Track visitor on page load
  const trackVisitor = async () => {
    try {
      const { data, error } = await supabase
        .from('graveyard_api_visitors')
        .insert([
          {
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            project_name: 'graveyard-api'
          }
        ])
        .select()

      if (error) {
        console.error('Error tracking visitor:', error)
      } else if (data && data[0]) {
        setVisitorId(data[0].id)
        console.log('Visitor tracked with ID:', data[0].id)
      }
    } catch (error) {
      console.error('Unexpected error tracking visitor:', error)
    }
  }

  // Add scroll to top on page refresh
  useEffect(() => {
    window.scrollTo(0, 0)
    trackVisitor() // Track visitor when page loads
  }, [])

  // Handle scroll events for active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'stats', 'problem', 'sample', 'endpoints', 'who-uses', 'contact']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial call
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const navHeight = 64 // Navigation bar height (h-16 = 4rem = 64px)
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - navHeight
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
    setIsMenuOpen(false)
  }

  const stats = [
    { label: 'Startup Failures', value: '15,000+', icon: TrendingDown },
    { label: 'Web3 Exploits', value: '2,500+', icon: Database },
    { label: 'Years of Data', value: '25+', icon: BarChart3 },
    { label: 'Data Sources', value: '6+', icon: Search },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background py-20 lg:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-2xl"></div>
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
              You're studying winners. <span className="text-accent">Here's data on everyone else.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-8 max-w-3xl mx-auto mb-8 text-balance">
              GraveyardAPI gives you structured data on failed startups and Web3 exploits—the half of the picture that causes survivorship bias. Query thousands of failures across sectors, chains, and decades.
            </p>
          </div>
        </div>
      </section>

      {/* Top Registration Form */}
      <section className="px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary mb-3">Get Early Access</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Be first to access GraveyardAPI when it launches.
            </p>

            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground h-11 px-4"
              />
              <Button
                type="submit"
                className="bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                disabled={submitted || isCheckingDuplicate}
              >
                {isCheckingDuplicate ? 'Checking...' : submitted ? 'Email Registered!' : 'Request Access'}
              </Button>
            </form>

            {submitted && (
              <div className="text-center text-sm text-green-600 font-medium">
                ✓ Successfully registered!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm transition-all duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-0'}`}>
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4 text-accent-foreground" />
            </div>
            <h1 className="text-xl font-bold text-primary">GraveyardAPI</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('hero')}
              className={`text-sm font-medium transition-colors hover:text-accent ${activeSection === 'hero' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'
                }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('stats')}
              className={`text-sm font-medium transition-colors hover:text-accent ${activeSection === 'stats' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'
                }`}
            >
              Stats
            </button>
            <button
              onClick={() => scrollToSection('endpoints')}
              className={`text-sm font-medium transition-colors hover:text-accent ${activeSection === 'endpoints' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'
                }`}
            >
              API
            </button>
            <button
              onClick={() => scrollToSection('who-uses')}
              className={`text-sm font-medium transition-colors hover:text-accent ${activeSection === 'who-uses' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'
                }`}
            >
              Use Cases
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className={`text-sm font-medium transition-colors hover:text-accent ${activeSection === 'contact' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'
                }`}
            >
              Contact
            </button>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="flex flex-col p-4 space-y-3">
            <button
              onClick={() => scrollToSection('hero')}
              className={`text-left px-4 py-3 rounded-lg transition-colors hover:bg-accent/10 ${activeSection === 'hero' ? 'bg-accent/10 text-accent' : 'text-muted-foreground'
                }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('stats')}
              className={`text-left px-4 py-3 rounded-lg transition-colors hover:bg-accent/10 ${activeSection === 'stats' ? 'bg-accent/10 text-accent' : 'text-muted-foreground'
                }`}
            >
              Stats
            </button>
            <button
              onClick={() => scrollToSection('endpoints')}
              className={`text-left px-4 py-3 rounded-lg transition-colors hover:bg-accent/10 ${activeSection === 'endpoints' ? 'bg-accent/10 text-accent' : 'text-muted-foreground'
                }`}
            >
              API Documentation
            </button>
            <button
              onClick={() => scrollToSection('who-uses')}
              className={`text-left px-4 py-3 rounded-lg transition-colors hover:bg-accent/10 ${activeSection === 'who-uses' ? 'bg-accent/10 text-accent' : 'text-muted-foreground'
                }`}
            >
              Use Cases
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className={`text-left px-4 py-3 rounded-lg transition-colors hover:bg-accent/10 ${activeSection === 'contact' ? 'bg-accent/10 text-accent' : 'text-muted-foreground'
                }`}
            >
              Contact
            </button>
            <div className="px-4 py-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Stats */}
      <section id="stats" className="py-16 lg:py-20 bg-gradient-to-b from-secondary/30 to-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">Trusted by Researchers Worldwide</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive failure data from multiple verified sources
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {React.createElement(stat.icon, { className: "w-8 h-8 text-accent group-hover:scale-110 transition-transform" })}
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="py-16 lg:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-medium mb-4">
                <BarChart3 className="w-4 h-4" />
                <span>The Survivorship Bias Problem</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-primary mb-6 text-center">Every dataset celebrates winners. We study the failures.</h3>
            <div className="grid md:grid-cols-3 gap-6 text-lg text-foreground leading-relaxed">
              <Card className="p-6 border-l-4 border-l-destructive">
                <h4 className="font-bold text-primary mb-3">Academic Research</h4>
                <p className="text-muted-foreground">
                  Studies need failure data to build accurate predictive models and understand business dynamics.
                </p>
              </Card>
              <Card className="p-6 border-l-4 border-l-accent">
                <h4 className="font-bold text-primary mb-3">Risk Analysis</h4>
                <p className="text-muted-foreground">
                  VCs and analysts require failure patterns to assess investment risks accurately.
                </p>
              </Card>
              <Card className="p-6 border-l-4 border-l-primary">
                <h4 className="font-bold text-primary mb-3">Journalism</h4>
                <p className="text-muted-foreground">
                  Investigative reporters need structured failure data for comprehensive reporting.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Response */}
      <section id="sample" className="py-16 lg:py-20 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-primary mb-4">Simple REST API</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Clean, structured JSON responses for easy integration
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-muted/50 border border-border rounded-xl overflow-hidden">
              <div className="bg-accent text-accent-foreground px-4 py-2 text-sm font-mono font-medium">
                GET /startups?sector=media&cause_of_death=market_timing
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="font-mono text-sm text-foreground">{`{
  "name": "Quibi",
  "founded": 2018,
  "died": 2020,
  "sector": "media",
  "funding_raised_usd": 1750000000,
  "cause_of_death": "market_timing",
  "country": "US",
  "employees_at_peak": 250,
  "post_mortem_url": "https://failory.com/case-studies/quibi",
  "similar_failures": ["Vine", "Meerkat"]
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section id="endpoints" className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-primary mb-4">Powerful Query Endpoints</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Filter by sector, year, chain, attack vector, and more
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {endpoints.map((endpoint, index) => (
              <Card key={endpoint.route} className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">{endpoint.method}</p>
                    <Search className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <p className="font-mono text-sm font-bold text-foreground mb-3">{endpoint.route}</p>
                  <p className="text-muted-foreground text-sm mb-4">{endpoint.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Filters:</span>
                    <p className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">{endpoint.filters}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who Uses This */}
      <section id="who-uses" className="py-16 lg:py-20 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-primary mb-4">Built for Data-Driven Professionals</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From academic research to quantitative trading
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {personas.map((persona, index) => (
              <Card key={persona.role} className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                      <Database className="w-5 h-5 text-accent" />
                    </div>
                    <h4 className="font-bold text-lg text-foreground">{persona.role}</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{persona.useCase}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 lg:py-20 bg-gradient-to-br from-secondary/30 to-background">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-background pointer-events-none"></div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-primary mb-4">Have Any Questions?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Feel free to reach out if you have any questions about our API, data sources, or need help getting started.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-card/50 border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-accent" />
                <span className="font-medium text-foreground">Get in Touch</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                We're here to help with any questions about GraveyardAPI, data access, or integration support.
              </p>

              {/* Email Registration Form */}
              <form onSubmit={handleWaitlist} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground h-11 px-4"
                />
                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                  disabled={submitted || isCheckingDuplicate}
                >
                  {isCheckingDuplicate ? 'Checking...' : submitted ? 'Registered!' : 'Send Email'}
                </Button>
              </form>

              {submitted && (
                <div className="text-center text-sm text-green-600 font-medium">
                  ✓ Successfully registered!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/20 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Branding */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-accent-foreground" />
                </div>
                <h3 className="font-bold text-lg text-primary">GraveyardAPI</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Structured data on failed startups and Web3 exploits for research and analysis.
              </p>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm mb-3 text-foreground">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="/privacy"
                    className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span>Privacy Policy</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://rekt.news"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span>Rekt.news</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span>Web3-Graveyard</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm mb-3 text-foreground">Connect</h4>
              <ul className="space-y-3 flex flex-col">
                <li>
                  <a
                    href="https://www.linkedin.com/in/abhisheksinha1506/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>LinkedIn</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:abhisheksinha1594@gmail.com"
                    className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>abhisheksinha1594@gmail.com</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              Currently in early access · Hosted on Vercel · Migrating to AWS for full launch
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} GraveyardAPI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const endpoints = [
  {
    method: 'GET',
    route: '/startups',
    description: 'Query failed startup data with filters for sector, cause of death, founding year, and country.',
    filters: 'sector, cause_of_death, year, country, funding_raised',
  },
  {
    method: 'GET',
    route: '/startups/:id',
    description: 'Get complete profile including post-mortem URL and similar failures.',
    filters: 'N/A',
  },
  {
    method: 'GET',
    route: '/web3/hacks',
    description: 'Query DeFi exploits and protocol hacks with chain and loss amount filters.',
    filters: 'chain, attack_type, min_loss_usd, year',
  },
  {
    method: 'GET',
    route: '/web3/hacks/:id',
    description: 'Get full exploit profile including transaction hash and PoC availability.',
    filters: 'N/A',
  },
]

const personas = [
  {
    role: 'Academic Researcher',
    useCase: 'Study failure patterns and build predictive models for startup longevity and risk factors.',
  },
  {
    role: 'Investigative Journalist',
    useCase: 'Research fraud cases, rug pulls, and protocol failures with structured data and source attribution.',
  },
  {
    role: 'VC Analyst',
    useCase: 'Build risk models and due diligence frameworks by analyzing historical failure causes and sectors.',
  },
  {
    role: 'Quant Fund',
    useCase: 'Integrate failure data into trading algorithms and hedge fund risk models for market analysis.',
  },
]

const dataSources = [
  {
    name: 'SEC EDGAR',
    description: 'Bankruptcy filings and corporate failure records from the SEC database.',
  },
  {
    name: 'Rekt.news',
    description: 'Crowdsourced DeFi exploits and security incidents with detailed post-mortems.',
  },
  {
    name: 'DeFiLlama Hacks',
    description: 'Comprehensive database of DeFi protocol hacks, losses, and attack vectors.',
  },
  {
    name: 'Failory',
    description: 'Post-mortems and case studies on why startups failed, with founder interviews.',
  },
  {
    name: 'startup-graveyard (OSS)',
    description: 'Open source Rails archive of dead companies with detailed historical data.',
  },
  {
    name: 'Web3-Graveyard (OSS)',
    description: 'Community-maintained database of DeFi exploits and Web3 project failures.',
  },
]

const faqs = [
  {
    question: 'How fresh is the data?',
    answer: 'We update our datasets weekly with new failures, hacks, and SEC filings. Core historical data is updated monthly to reflect any corrections or newly discovered incidents.',
  },
  {
    question: 'How many records are in the database?',
    answer: 'We currently have 15,000+ startup failure records spanning 25 years, and 2,500+ documented DeFi exploits. These numbers grow weekly as new data is discovered and aggregated.',
  },
  {
    question: 'Do I need an API key?',
    answer: 'Yes, all API requests require a valid API key. You can request one through our early access program. Public tier keys support up to 1,000 requests per day.',
  },
  {
    question: 'Is bulk CSV export available?',
    answer: 'CSV exports are available for all Pro tier users. You can export filtered datasets on-demand. Enterprise plans include automated scheduled exports.',
  },
  {
    question: 'Can I request specific companies or protocols be added?',
    answer: 'Absolutely. Submit requests through your dashboard or email us directly. We prioritize additions based on academic and research interest.',
  },
]
