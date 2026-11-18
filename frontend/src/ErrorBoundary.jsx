import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page">
          <h1>Something went wrong</h1>
          <p className="subtitle">Please go back and try again.</p>
          <button className="btn-primary" onClick={() => window.location.href = '/'}>
            Back to Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary