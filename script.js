// DOM Elements
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');
const closeBtn = document.getElementById('closeSidebar');
const aboutUsBtn = document.getElementById('aboutUs');
const likeUsBtn = document.getElementById('likeUs');
const moreAppsBtn = document.getElementById('moreApps');
const supportUsBtn = document.getElementById('supportUs');

// Bootstrap Modal
const aboutModal = new bootstrap.Modal(document.getElementById('aboutModal'));

// Sidebar Toggle
toggleBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== toggleBtn) {
        sidebar.classList.remove('active');
    }
});

// Menu Item Actions
aboutUsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    aboutModal.show();
    sidebar.classList.remove('active');
});

likeUsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // URL will be provided later
    alert('Like Us page coming soon!');
});

moreAppsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // URL will be provided later
    alert('More Apps page coming soon!');
});

// Support Us and PayPal Integration
document.getElementById('supportUs').addEventListener('click', () => {
    const supportModal = new bootstrap.Modal(document.getElementById('supportModal'));
    supportModal.show();
});

// Handle donation amount selection
document.querySelectorAll('input[name="donationAmount"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const customContainer = document.getElementById('customAmountContainer');
        if (e.target.value === 'custom') {
            customContainer.style.display = 'block';
        } else {
            customContainer.style.display = 'none';
        }
    });
});

// Initialize PayPal
paypal.Buttons({
    createOrder: function(data, actions) {
        const selectedAmount = document.querySelector('input[name="donationAmount"]:checked').value;
        const amount = selectedAmount === 'custom' 
            ? document.getElementById('customAmountInput').value 
            : selectedAmount;

        if (!amount || amount < 1) {
            alert('Please enter a valid donation amount');
            return;
        }

        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: amount.toString()
                },
                description: 'Donation to Holly Name Generator'
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            // Show success message
            const supportModal = bootstrap.Modal.getInstance(document.getElementById('supportModal'));
            supportModal.hide();
            
            // Create and show thank you toast
            const toastHTML = `
                <div class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="d-flex">
                        <div class="toast-body">
                            <i class="fas fa-heart"></i> Thank you for your support, ${details.payer.name.given_name}!
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', toastHTML);
            const toast = new bootstrap.Toast(document.querySelector('.toast:last-child'));
            toast.show();
        });
    },
    onError: function(err) {
        console.error('PayPal error:', err);
        alert('There was an error processing your donation. Please try again.');
    }
}).render('#paypal-button-container');
