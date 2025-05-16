'use strict';

class BirthdayApp {
  constructor() {
    this.hasTriggeredBirthday = false;
    this.initialize();
  }

  initialize() {
    this.setupCountdown();
    this.setupAudioSystem();
    this.setupErrorHandling();
    this.checkBirthdayStatus();
  }

  /* ========== 倒计时模块 ========== */
  setupCountdown() {
    this.targetDate = new Date('2025-03-02T00:00:00+08:00');
    this.timeElements = {
      days: document.getElementById('days'),
      hours: document.getElementById('hours'),
      minutes: document.getElementById('minutes'),
      seconds: document.getElementById('seconds')
    };

    this.updateCountdown();
    setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown() {
    const now = new Date();
    const diff = this.targetDate - now;

    if (diff <= 0) {
      this.handleBirthdayStart();
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    this.timeElements.days.textContent = days.toString().padStart(2, '0');
    this.timeElements.hours.textContent = hours.toString().padStart(2, '0');
    this.timeElements.minutes.textContent = minutes.toString().padStart(2, '0');
    this.timeElements.seconds.textContent = seconds.toString().padStart(2, '0');
  }

  /* ========== 生日特效 ========== */
  handleBirthdayStart() {
    if (this.hasTriggeredBirthday) return;
    this.hasTriggeredBirthday = true;
    
    document.body.classList.add('birthday-active');
    this.createConfettiEffect();
    this.showBirthdayMessage();
  }

  /* ========== 持续纸屑特效 ========== */
  createConfettiEffect() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999;
    `;
    document.body.appendChild(canvas);

    const totalParticles = 50;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
    const gravity = 0.5;
    const drag = 0.075;
    const terminalVelocity = 8;

    class ConfettiParticle {
      constructor() {
        this.reset();
        this.rotation = Math.random() * Math.PI * 2;
        this.rotateSpeed = (Math.random() - 0.5) * 0.2;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.velX = (Math.random() - 0.5) * 10;
        this.velY = Math.random() * -15 - 5;
        this.size = Math.random() * 10 + 6;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.velY += gravity;
        this.velX *= (1 - drag);
        this.velY = Math.min(this.velY, terminalVelocity);
        
        this.x += this.velX;
        this.y += this.velY;
        this.rotation += this.rotateSpeed;

        if (this.y > canvas.height + this.size || 
            this.x < -this.size || 
            this.x > canvas.width + this.size) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
      }
    }

    for (let i = 0; i < totalParticles; i++) {
      particles.push(new ConfettiParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();
  }

  /* ========== 优化文字显示 ========== */
  showBirthdayMessage() {
    if (document.getElementById('birthday-text')) return;

    const birthdayText = document.createElement('div');
    birthdayText.id = 'birthday-text';
    birthdayText.textContent = '生日快乐！';

    const style = document.createElement('style');
    style.textContent = `
      @keyframes smoothPop {
        0% {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0;
        }
        100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
      }

      #birthday-text {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: min(8em, 12vw);
        color: #FF6B6B;
        -webkit-text-stroke: 2px #fff;
        text-stroke: 2px #fff;
        text-shadow: 0 0 20px rgba(255,107,107,0.4);
        animation: smoothPop 0.8s cubic-bezier(0.25, 0.46, 0.45, 1.2) forwards;
        z-index: 1000;
        font-family: 'Microsoft YaHei', sans-serif;
        white-space: nowrap;
        pointer-events: none;
        text-align: center;
        max-width: 95%;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      @media (max-width: 480px) {
        #birthday-text {
          -webkit-text-stroke: 1.5px #fff;
          text-stroke: 1.5px #fff;
          font-size: min(6em, 14vw);
          text-shadow: 0 0 15px rgba(255,107,107,0.4);
        }
      }
    `;

    // 动态字体调整
    const updateFontSize = () => {
      const element = document.getElementById('birthday-text');
      if (element) {
        const viewportWidth = window.innerWidth;
        const baseSize = Math.min(viewportWidth * 0.18, 120);
        element.style.fontSize = `${baseSize}px`;
      }
    };

    window.addEventListener('resize', updateFontSize);
    updateFontSize();

    document.head.appendChild(style);
    document.body.appendChild(birthdayText);
  }

  /* ========== 音频控制系统 ========== */
  setupAudioSystem() {
    this.bgAudio = document.getElementById('bgMusic');
    this.bgToggle = document.getElementById('bgMusicToggle');
    this.currentTrack = null;
    
    this.bgAudio.volume = 0.5;

    this.bgToggle.addEventListener('click', () => this.toggleBackgroundMusic());

    document.querySelector('.music-gallery').addEventListener('click', (e) => {
      const playButton = e.target.closest('.play-icon');
      if (playButton) this.handleTrackPlay(playButton);
    });
  }

  toggleBackgroundMusic() {
    if (this.bgAudio.paused) {
      this.stopAllTracks();
      this.bgAudio.play();
    } else {
      this.bgAudio.pause();
    }
    this.updateBgMusicIcon();
  }

  updateBgMusicIcon() {
    const icon = this.bgAudio.paused ? 'play' : 'pause';
    this.bgToggle.innerHTML = `<i class="fas fa-${icon}"></i>`;
  }

  handleTrackPlay(playButton) {
    const audioSrc = playButton.dataset.audio;
    const card = playButton.closest('.music-card');

    if (card.classList.contains('playing')) {
      this.currentTrack.pause();
      return;
    }

    this.stopAllTracks();

    const audio = new Audio(audioSrc);
    audio.preload = 'metadata';
    audio.volume = 0.8;

    audio.addEventListener('play', () => this.onTrackPlay(audio, card, playButton));
    audio.addEventListener('pause', () => this.onTrackPause(card, playButton));
    audio.addEventListener('ended', () => this.onTrackEnd(card));
    audio.addEventListener('error', (e) => this.handleAudioError(e, audioSrc, card));

    this.showLoadingState(card, playButton);
    audio.play().catch(error => this.handlePlayError(error, card));
  }

  onTrackPlay(audio, card, playButton) {
    card.classList.add('playing');
    playButton.querySelector('i').className = 'fas fa-pause';
    this.currentTrack = audio;
    
    if (!this.bgAudio.paused) {
      this.bgAudio.pause();
      this.updateBgMusicIcon();
    }
  }

  onTrackPause(card, playButton) {
    card.classList.remove('playing');
    playButton.querySelector('i').className = 'fas fa-play';
  }

  onTrackEnd(card) {
    card.classList.remove('playing');
    this.currentTrack = null;
  }

  showLoadingState(card, playButton) {
    card.classList.add('loading');
    playButton.querySelector('i').className = 'fas fa-spinner fa-spin';
  }

  stopAllTracks() {
    if (this.currentTrack) {
      this.currentTrack.pause();
      document.querySelectorAll('.music-card.playing, .music-card.loading').forEach(card => {
        card.classList.remove('playing', 'loading');
        card.querySelector('.play-icon i').className = 'fas fa-play';
      });
      this.currentTrack = null;
    }
  }

  /* ========== 错误处理 ========== */
  handleAudioError(e, audioSrc, card) {
    console.error('音频加载失败:', e);
    card.classList.remove('loading', 'playing');
    alert(`无法播放: ${audioSrc.split('/').pop()}`);
  }

  handlePlayError(error, card) {
    console.error('播放被阻止:', error);
    card.classList.remove('loading', 'playing');
  }

  setupErrorHandling() {
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', () => {
        img.src = img.parentElement.classList.contains('album-cover') 
          ? 'picture/placeholder-album.jpg'
          : 'picture/placeholder-generic.jpg';
      });
    });

    window.addEventListener('error', e => {
      console.error('全局错误:', e);
      alert('发生意外错误，请刷新页面');
    });
  }

  /* ========== 生日状态检测 ========== */
  checkBirthdayStatus() {
    if (this.hasTriggeredBirthday) return;
    const now = new Date();
    const isBirthday = now.getFullYear() === 2025 &&
      now.getMonth() === 2 &&
      now.getDate() === 2;
    
    if (isBirthday) this.handleBirthdayStart();
  }
}

document.addEventListener('DOMContentLoaded', () => new BirthdayApp());
