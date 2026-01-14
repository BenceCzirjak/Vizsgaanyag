function toggleMode() {
  document.body.classList.toggle('dark');
}

function toggleMenu() {
  const nav = document.querySelector('nav ul');
  nav.classList.toggle('active');
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Booking form submission
function handleBooking(event) {
  event.preventDefault(); // Prevent form submission
  const modal = document.getElementById('bookingModal');
  modal.style.display = "block"; // Show modal
}

// Close modal
function closeModal() {
  const modal = document.getElementById('bookingModal');
  modal.style.display = "none"; // Hide modal
}

// Room visibility on scroll
const rooms = document.querySelectorAll('.room');
window.addEventListener('scroll', () => {
  rooms.forEach(r => {
    const top = r.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      r.classList.add('show');
    }
  });
});