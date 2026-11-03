window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ---------- Value 섹션 스크롤 크로스페이드 ---------- */
const valueSection = document.querySelector('.value-section');
const valueItems = document.querySelectorAll('.value-item');

function updateValueSection() {
  const rect = valueSection.getBoundingClientRect();
  const scrollableHeight = valueSection.offsetHeight - window.innerHeight;
  let progress = -rect.top / scrollableHeight;
  progress = Math.min(Math.max(progress, 0), 0.999);

  const activeIndex = Math.floor(progress * valueItems.length);

  valueItems.forEach((item, i) => {
    item.classList.toggle('active', i === activeIndex);
  });
}

window.addEventListener('scroll', updateValueSection);
window.addEventListener('resize', updateValueSection);
updateValueSection();

/* ---------- Partnership 섹션: 세로 스크롤 -> 가로 이동 (부드럽게 보간 처리) ---------- */
const partnershipSection = document.querySelector('.partnership-section');
const partnershipSticky = document.querySelector('.partnership-sticky');
const partnershipTrack = document.querySelector('.partnership-track');

let partnershipTarget = 0;
let partnershipCurrent = 0;

const PARTNERSHIP_SCROLL_PACE = 1.4; // dial: 1.0 = 이동 거리만큼만 스크롤, 클수록 스크롤이 더 여유롭게 느껴짐 (기존엔 사실상 2.7배라 뒷부분이 텅 빈 스크롤이었음)

// 로고 트랙 실제 너비에 맞춰 섹션 높이를 동적으로 계산 (죽은 스크롤 구간 제거)
function setPartnershipHeight() {
  const maxTranslate = partnershipTrack.scrollWidth - partnershipSticky.clientWidth;
  partnershipSection.style.height = `${(maxTranslate * PARTNERSHIP_SCROLL_PACE) + window.innerHeight}px`;
}

function calcPartnershipTarget() {
  const rect = partnershipSection.getBoundingClientRect();
  const scrollableHeight = partnershipSection.offsetHeight - window.innerHeight;
  let progress = -rect.top / scrollableHeight;
  partnershipTarget = Math.min(Math.max(progress, 0), 1);
}

function animatePartnership() {
  // 목표 지점(partnershipTarget)으로 매 프레임 조금씩 부드럽게 따라감
  partnershipCurrent += (partnershipTarget - partnershipCurrent) * 0.08;

  const maxTranslate = partnershipTrack.scrollWidth - partnershipSticky.clientWidth;
  partnershipTrack.style.transform = `translate3d(-${partnershipCurrent * maxTranslate}px, 0, 0)`;

  requestAnimationFrame(animatePartnership);
}

function refreshPartnershipLayout() {
  setPartnershipHeight();
  calcPartnershipTarget();
}

window.addEventListener('scroll', calcPartnershipTarget);
window.addEventListener('resize', refreshPartnershipLayout);
window.addEventListener('load', refreshPartnershipLayout);
refreshPartnershipLayout();
animatePartnership(); // rAF 루프 시작 (스크롤 이벤트에 직접 의존하지 않아 끊김 없이 부드러움)