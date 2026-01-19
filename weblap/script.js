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
    const target = this.getAttribute('href');
    if (!target || target === '#') {
      return;
    }
    const targetEl = document.querySelector(target);
    if (!targetEl) {
      return;
    }
    e.preventDefault();
    targetEl.scrollIntoView({
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
const revealRooms = () => {
  rooms.forEach(r => {
    const top = r.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      r.classList.add('show');
    }
  });
};

window.addEventListener('scroll', revealRooms);
window.addEventListener('load', revealRooms);

const bookingStorageKey = 'aranyligetBooking';
const loadBooking = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(bookingStorageKey));
    return saved || { room: null, extras: [], checkin: '', checkout: '' };
  } catch (error) {
    return { room: null, extras: [], checkin: '', checkout: '' };
  }
};

const saveBooking = data => {
  localStorage.setItem(bookingStorageKey, JSON.stringify(data));
};

const markAdded = button => {
  button.textContent = 'Hozzáadva';
  button.disabled = true;
};

const resetRoomButtons = buttons => {
  buttons
    .filter(button => button.dataset.bookingAdd === 'room')
    .forEach(button => {
      button.textContent = 'Hozzáadás a foglaláshoz';
      button.disabled = false;
    });
};

const bookingButtons = Array.from(document.querySelectorAll('.add-to-booking'));
if (bookingButtons.length) {
  const saved = loadBooking();
  bookingButtons.forEach(button => {
    const type = button.dataset.bookingAdd;
    const name = button.dataset.name;
    if (type === 'room' && saved.room && saved.room.name === name) {
      markAdded(button);
    }
    if (type === 'extra' && saved.extras && saved.extras.some(extra => extra.name === name)) {
      markAdded(button);
    }
  });

  bookingButtons.forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.bookingAdd;
      const name = button.dataset.name || 'Választás';
      const price = Number(button.dataset.price || 0);
      const capacity = Number(button.dataset.capacity || 0);
      const current = loadBooking();
      if (type === 'room') {
        current.room = { name, price, capacity };
        resetRoomButtons(bookingButtons);
      }
      if (type === 'extra') {
        if (!current.extras) {
          current.extras = [];
        }
        if (!current.extras.some(extra => extra.name === name)) {
          current.extras.push({ name, price });
        }
      }
      saveBooking(current);
      markAdded(button);
    });
  });
}

// Shop filters
const filterButtons = Array.from(document.querySelectorAll('.chip[data-filter]'));
const shopGrid = document.getElementById('shopGrid');
if (filterButtons.length && shopGrid) {
  const cards = Array.from(shopGrid.querySelectorAll('[data-category]'));
  const applyFilter = filter => {
    cards.forEach(card => {
      const matches = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !matches);
    });
  };

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      applyFilter(button.dataset.filter || 'all');
    });
  });
}

// Order summary
const orderForm = document.getElementById('bookingForm');
if (orderForm) {
  const roomOptions = Array.from(document.querySelectorAll('input[name="room"]'));
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');
  const extras = Array.from(document.querySelectorAll('.extra'));
  const summaryItems = document.getElementById('summaryItems');
  const summaryRoomName = document.getElementById('summaryRoomName');
  const summaryNights = document.getElementById('summaryNights');
  const cityTaxAmount = document.getElementById('cityTaxAmount');
  const orderTotal = document.getElementById('orderTotal');
  const summaryNote = document.getElementById('summaryNote');
  const capacityNote = document.getElementById('capacityNote');
  const guestsInput = document.getElementById('guests');

  const CITY_TAX_PER_NIGHT = 1500;

  const nightsBetween = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate - startDate;
    if (Number.isNaN(diff) || diff <= 0) return 0;
    return Math.round(diff / 86400000);
  };

  const formatCurrency = value => `${value.toFixed(0)} Ft`;

  const updateSummary = () => {
    const nights = nightsBetween(checkinInput.value, checkoutInput.value);
    const selectedOption = roomOptions.find(option => option.checked);
    const roomName = selectedOption && selectedOption.value ? selectedOption.value : 'Válassz szobát';
    const roomPrice = selectedOption && selectedOption.dataset.price ? Number(selectedOption.dataset.price) : 0;
    const roomCapacity = selectedOption && selectedOption.dataset.capacity ? Number(selectedOption.dataset.capacity) : 0;

    summaryRoomName.textContent = roomName;
    summaryNights.textContent = `${nights} éj`;

    summaryItems.innerHTML = '';
    let extrasTotal = 0;
    extras.forEach(extra => {
      if (!extra.checked) return;
      const label = extra.dataset.label || 'Extra';
      const price = Number(extra.dataset.price || 0);
      extrasTotal += price;
      const row = document.createElement('div');
      row.className = 'summary-row';
      row.innerHTML = `<span>${label}</span><span>${formatCurrency(price)}</span>`;
      summaryItems.appendChild(row);
    });

    const cityTax = nights * CITY_TAX_PER_NIGHT;
    cityTaxAmount.textContent = formatCurrency(cityTax);

    const roomTotal = nights * roomPrice;
    const total = roomTotal + extrasTotal + cityTax;
    orderTotal.textContent = formatCurrency(total);

    if (nights > 0 && roomPrice > 0) {
      summaryNote.textContent = `Szoba ${formatCurrency(roomPrice)} / éj + extrák.`;
    } else {
      summaryNote.textContent = 'Válassz dátumot és szobát az összeghez.';
    }

    const guests = Number(guestsInput.value || 0);
    if (roomCapacity > 0 && guests > 0) {
      if (guests > roomCapacity) {
        capacityNote.textContent = `Figyelem: ${guests} főhöz ez a szoba kevés (férőhely: ${roomCapacity} fő).`;
      } else {
        capacityNote.textContent = `Férőhely megfelel: ${roomCapacity} fő.`;
      }
    } else {
      capacityNote.textContent = '';
    }

    saveBooking({
      room: roomPrice > 0 ? { name: roomName, price: roomPrice, capacity: roomCapacity } : null,
      extras: extras
        .filter(extra => extra.checked)
        .map(extra => ({
          name: extra.dataset.label || 'Extra',
          price: Number(extra.dataset.price || 0)
        })),
      checkin: checkinInput.value,
      checkout: checkoutInput.value
    });
  };

  ['change', 'input'].forEach(evt => {
    orderForm.addEventListener(evt, updateSummary);
  });

  const saved = loadBooking();
  if (saved.room && saved.room.name) {
    roomOptions.forEach(option => {
      if (option.value === saved.room.name) {
        option.checked = true;
      }
    });
  }
  if (saved.checkin) {
    checkinInput.value = saved.checkin;
  }
  if (saved.checkout) {
    checkoutInput.value = saved.checkout;
  }
  if (Array.isArray(saved.extras)) {
    extras.forEach(extra => {
      const label = extra.dataset.label || '';
      if (saved.extras.some(savedExtra => savedExtra.name === label)) {
        extra.checked = true;
      }
    });
  }

  updateSummary();
}
