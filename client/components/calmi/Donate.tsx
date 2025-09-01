< !DOCTYPE html >
  <html lang="en">
    <head>
      <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Donation Widget</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
              extend: {
              colors: {
              primary: '#3B82F6',
            secondary: '#EFF6FF',
            muted: '#64748B',
            background: '#F8FAFC',
            foreground: '#020617'
                    }
                }
            }
        }
          </script>
          <style>
            body {
              font - family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background: linear-gradient(135deg, #f0f9ff 0%, #cbebff 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px;
        }
            .donate-container {
              transition: all 0.3s ease;
        }
            button:disabled {
              cursor: not-allowed;
            opacity: 0.7;
        }
            .loading-spinner {
              border: 2px solid #f3f3f3;
            border-top: 2px solid #3B82F6;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 8px;
        }
            @keyframes spin {
              0 % { transform: rotate(0deg); }
            100% {transform: rotate(360deg); }
        }
          </style>
        </head>
        <body>
          <div class="donate-container w-full max-w-2xl">
            <section id="donate" class="rounded-2xl bg-white/70 backdrop-blur border p-6 shadow-lg">
              <h2 class="text-2xl font-semibold text-primary mb-3">Support Us</h2>
              <p class="text-sm text-muted-foreground mb-4">Your donation helps keep our platform free and supports our mission.</p>

              <div class="grid md:grid-cols-3 gap-4 items-end">
                <div>
                  <label class="text-sm font-medium">Amount (USD)</label>
                  <div class="flex gap-2 mt-1">
                    <button onclick="setAmount(5)" class="px-3 py-2 rounded-lg border hover:bg-secondary amount-btn">$5</button>
                    <button onclick="setAmount(10)" class="px-3 py-2 rounded-lg border hover:bg-secondary amount-btn bg-secondary">$10</button>
                    <button onclick="setAmount(100)" class="px-3 py-2 rounded-lg border hover:bg-secondary amount-btn">$100</button>
                  </div>
                  <input type="number" min="1" class="mt-2 w-full px-3 py-2 rounded-lg border bg-background" value="10" oninput="updateCustomAmount(this.value)" />
                </div>

                <div>
                  <label class="text-sm font-medium">Email (for receipt)</label>
                  <input type="email" class="mt-1 w-full px-3 py-2 rounded-lg border bg-background" placeholder="you@example.com" oninput="updateEmail(this.value)" />
                </div>

                <div class="flex gap-2 md:justify-end">
                  <button onclick="handleDonate()" id="donate-btn" class="h-10 px-4 rounded-lg text-white bg-primary hover:brightness-110 flex items-center justify-center">
                    Donate
                  </button>
                </div>
              </div>

              <div id="status-message" class="mt-3 text-xs text-muted-foreground hidden"></div>
            </section>

            <div class="mt-6 text-center text-sm text-muted-foreground">
              <p>This is a demo integration. In a real application, your Paystack public key would be securely loaded from your backend.</p>
            </div>
          </div>

          <script>
        // Configuration - replace with your actual Paystack public key
            const PAYSTACK_PUBLIC_KEY = "pk_test_142d9de331100ce1a3d48e9f09e17377e1d3ead0";

            // State
            let amount = 10;
            let email = "";
            let isPaystackLoaded = false;
            let isLoading = false;

            // Initialize the component
            function init() {
              loadPaystackScript();
        }

            // Load Paystack script
            function loadPaystackScript() {
            if (typeof window.PaystackPop !== 'undefined') {
              isPaystackLoaded = true;
            updateStatusMessage("Payment system ready");
            return;
            }

            updateStatusMessage("Loading payment system...");

            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            script.async = true;
            script.crossOrigin = 'anonymous';
            
            script.onload = () => {
              isPaystackLoaded = true;
            updateStatusMessage("Payment system ready");
            };
            
            script.onerror = () => {
              updateStatusMessage("Failed to load payment system. Please refresh the page.", true);
            };

            document.body.appendChild(script);
        }

            // Update amount
            function setAmount(newAmount) {
              amount = newAmount;

            // Update UI
            document.querySelectorAll('.amount-btn').forEach(btn => {
              btn.classList.remove('bg-secondary');
            });

            event.target.classList.add('bg-secondary');
            document.querySelector('input[type="number"]').value = newAmount;
        }

            // Update custom amount
            function updateCustomAmount(newAmount) {
              amount = Number(newAmount);

            // Remove highlight from all amount buttons when custom amount is entered
            document.querySelectorAll('.amount-btn').forEach(btn => {
              btn.classList.remove('bg-secondary');
            });
        }

            // Update email
            function updateEmail(newEmail) {
              email = newEmail;
        }

            // Handle donation
            function handleDonate() {
            if (!isPaystackLoaded) {
              alert("Payment system is still loading. Please try again in a moment.");
            return;
            }

            if (!PAYSTACK_PUBLIC_KEY) {
              alert("Payments are temporarily unavailable. Please try again later.");
            return;
            }

            const cents = Math.round(Number(amount || 0) * 100);
            if (!cents) {
              alert("Please enter a valid amount.");
            return;
            }

            // For demo purposes, we'll use a mock implementation
            // In a real application, you would use the PaystackPop API
            simulatePayment();
        }

            // Simulate payment for demo purposes
            function simulatePayment() {
              setIsLoading(true);

            // Simulate API call delay
            setTimeout(() => {
              setIsLoading(false);

            // Show success message
            alert(`Thank you for your donation of $${amount}! Payment processed successfully.`);

                // In a real application, you would use:
                /*
                const handler = PaystackPop.setup({
              key: PAYSTACK_PUBLIC_KEY,
            email: email || `donor+${Date.now()}@example.com`,
            amount: cents,
            currency: 'USD',
            callback: function(response) {
              alert('Payment complete! Reference: ' + response.reference);
                    },
            onClose: function() {
              alert('Payment window closed.');
                    }
                });
            handler.openIframe();
            */
            }, 2000);
        }

            // Set loading state
            function setIsLoading(loading) {
              isLoading = loading;
            const button = document.getElementById('donate-btn');

            if (loading) {
              button.innerHTML = '<div class="loading-spinner"></div> Processing...';
            button.disabled = true;
            } else {
              button.innerHTML = 'Donate';
            button.disabled = false;
            }
        }

            // Update status message
            function updateStatusMessage(message, isError = false) {
            const statusEl = document.getElementById('status-message');
            statusEl.textContent = message;
            statusEl.classList.remove('hidden');

            if (isError) {
              statusEl.classList.add('text-red-500');
            } else {
              statusEl.classList.remove('text-red-500');
            }
        }

            // Initialize when page loads
            window.onload = init;
          </script>
        </body>
      </html>