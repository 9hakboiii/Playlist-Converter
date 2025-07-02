const Sidebar = () => {
  return (
    <div className="sidebar p-4 d-none d-md-block">
      <div className="mb-5">
        <h1 className="h4 fw-bold text-white d-flex align-items-center">
          <i className="fab fa-spotify text-spotify-green me-2 fs-3"></i>
          Playlist Converter
        </h1>
      </div>
      
      <ul className="list-unstyled">
        <li className="mb-3">
          <a href="#" className="d-flex align-items-center text-white text-decoration-none">
            <i className="fas fa-home me-3"></i>
            Home
          </a>
        </li>
        <li className="mb-3">
          <a href="#" className="d-flex align-items-center text-white text-decoration-none">
            <i className="fas fa-search me-3"></i>
            Search
          </a>
        </li>
        <li className="mb-3">
          <a href="#" className="d-flex align-items-center text-white text-decoration-none">
            <i className="fas fa-bookmark me-3"></i>
            Your Library
          </a>
        </li>
        <li className="mb-3 mt-5">
          <a href="#" className="d-flex align-items-center text-white text-decoration-none">
            <i className="fas fa-plus-square me-3"></i>
            Create Playlist
          </a>
        </li>
        <li className="mb-3">
          <a href="#" className="d-flex align-items-center text-white text-decoration-none">
            <i className="fas fa-heart me-3"></i>
            Liked Songs
          </a>
        </li>
      </ul>
      
      <div className="border-top border-spotify-gray mt-5 pt-3">
        <small className="text-spotify-light-gray">
          &copy; 2023 Playlist Converter
        </small>
      </div>
    </div>
  )
}

export default Sidebar 