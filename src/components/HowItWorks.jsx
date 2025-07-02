const HowItWorks = () => {
  const steps = [
    {
      icon: "fab fa-youtube",
      title: "YouTube URL 입력",
      description: "YouTube 플레이리스트나 개별 동영상 링크를 입력하세요. 챕터가 있는 동영상도 지원합니다.",
      color: "bg-red-600",
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: "fas fa-magic",
      title: "자동 분석 & 매칭",
      description: "AI가 각 곡을 분석하고 Spotify에서 정확한 트랙을 찾아 매칭합니다.",
      color: "bg-purple-600",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: "fab fa-spotify",
      title: "Spotify 플레이리스트 생성",
      description: "매칭된 곡들로 새로운 플레이리스트가 자동으로 Spotify 계정에 생성됩니다.",
      color: "bg-spotify-green",
      gradient: "from-green-400 to-spotify-green"
    }
  ]

  return (
    <div className="position-relative py-5 overflow-hidden" 
         style={{background: 'linear-gradient(to bottom, var(--spotify-dark), black)'}}>
      {/* Background Pattern */}
      <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25">
        <div className="position-absolute border border-spotify-green rounded-circle" 
             style={{top: '40px', left: '40px', width: '128px', height: '128px'}}></div>
        <div className="position-absolute border border-spotify-green rounded-circle" 
             style={{top: '128px', right: '80px', width: '96px', height: '96px'}}></div>
        <div className="position-absolute border border-spotify-green rounded-circle" 
             style={{bottom: '80px', left: '33%', width: '160px', height: '160px'}}></div>
      </div>

      <div className="container position-relative" style={{zIndex: 10}}>
        {/* Header Section */}
        <div className="text-center mb-5">
          <h2 className="display-4 display-md-3 fw-bold text-white mb-3">
            간단한 <span className="text-spotify-green">3단계</span>로 완성
          </h2>
          <p className="fs-5 text-spotify-light-gray mx-auto" style={{maxWidth: '40rem'}}>
            복잡한 설정 없이 몇 번의 클릭만으로 YouTube 플레이리스트를 Spotify로 옮기세요
          </p>
        </div>
        
        {/* Steps Grid */}
        <div className="row g-4 g-lg-5">
          {steps.map((step, index) => (
            <div key={index} className="col-12 col-lg-4 position-relative">
              {/* Connection Line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="d-none d-lg-block position-absolute" 
                     style={{
                       top: '48px', 
                       left: '100%', 
                       width: '48px', 
                       height: '2px',
                       background: 'linear-gradient(to right, var(--spotify-green), var(--spotify-light-gray))',
                       zIndex: 0,
                       transform: 'translateX(32px)'
                     }}>
                  <div className="position-absolute end-0 top-50 translate-middle bg-spotify-green rounded-circle" 
                       style={{width: '12px', height: '12px'}}></div>
                </div>
              )}

              {/* Step Card */}
              <div className="position-relative bg-spotify-light p-4 p-md-5 rounded shadow"
                   style={{
                     zIndex: 10,
                     transition: 'all 0.3s ease'
                   }}>
                {/* Step Number */}
                <div className="position-absolute bg-spotify-green rounded-circle d-flex align-items-center justify-content-center text-dark fw-bold fs-5 shadow"
                     style={{
                       top: '-16px',
                       left: '-16px',
                       width: '48px',
                       height: '48px'
                     }}>
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="rounded d-flex align-items-center justify-content-center mx-auto mb-4 shadow"
                     style={{
                       width: '80px',
                       height: '80px',
                       background: step.gradient.includes('red') ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                                  step.gradient.includes('purple') ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' :
                                  'linear-gradient(135deg, #4ade80, var(--spotify-green))',
                       transition: 'transform 0.3s ease'
                     }}>
                  <i className={`${step.icon} fs-2 text-white`}></i>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="fw-bold h5 text-white mb-3" style={{transition: 'color 0.3s ease'}}>
                    {step.title}
                  </h3>
                  <p className="text-spotify-light-gray mb-0">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-5 p-4 p-md-5 rounded"
             style={{background: 'linear-gradient(to right, var(--spotify-light), var(--spotify-gray))'}}>
          <h3 className="h4 fw-bold text-white mb-3">지금 바로 시작해보세요!</h3>
          <p className="text-spotify-light-gray mb-4">수백만 곡을 Spotify에서 즐기세요</p>
          <button 
            onClick={() => {
              document.querySelector('input[type="text"]')?.scrollIntoView({ behavior: 'smooth' })
              setTimeout(() => document.querySelector('input[type="text"]')?.focus(), 500)
            }}
            className="btn bg-spotify-green text-dark fw-bold px-4 py-3 rounded-pill shadow"
            style={{transition: 'all 0.3s ease'}}
          >
            <i className="fas fa-rocket me-2"></i>
            무료로 시작하기
          </button>
        </div>

        {/* Statistics */}
        <div className="row g-4 mt-5 text-center">
          <div className="col-6 col-md-3">
            <div className="display-5 fw-bold text-spotify-green mb-2">98%</div>
            <small className="text-spotify-light-gray">매칭 성공률</small>
          </div>
          <div className="col-6 col-md-3">
            <div className="display-5 fw-bold text-spotify-green mb-2">10초</div>
            <small className="text-spotify-light-gray">평균 변환 시간</small>
          </div>
          <div className="col-6 col-md-3">
            <div className="display-5 fw-bold text-spotify-green mb-2">무제한</div>
            <small className="text-spotify-light-gray">플레이리스트 변환</small>
          </div>
          <div className="col-6 col-md-3">
            <div className="display-5 fw-bold text-spotify-green mb-2">100%</div>
            <small className="text-spotify-light-gray">무료 서비스</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks 