import React from 'react'

function Navbar() {
    
  return (
    <div>
        <div className="container mt-4 ">
            <ul className="nav nav-pills d-flex justify-content-between">
            <li>
                <a href="/" className='d-flex gap-2 justify-content-center align-items-center text-decoration-none'>
                    <img src="/src/assets/logo.png" alt="" width={45} />
                    <h6 className="mb-0" style={{ color: '#2c83df' }}>Risk Calculator</h6>
                </a>
            </li>

                <div className="d-flex gap-3">
                    <li className="nav-item">
                        <a className="nav-link " href="/login">Login</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link active " href="/register">Register</a>
                    </li>
                </div>
            </ul>
        </div>
    </div>
  )
}

export default Navbar