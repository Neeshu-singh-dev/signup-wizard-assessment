var currentStep = 1;
var resendSeconds = 0;
var data = { email: '', firstName: '', lastName: '' };
var demoOtp = '123456';

var cities = { delhi: ['New Delhi'], maharashtra: ['Mumbai', 'Pune'], karnataka: ['Bengaluru'] };
var colleges = {
  'delhi|New Delhi': ['Delhi University', 'Jawaharlal Nehru University'],
  'maharashtra|Mumbai': ['University of Mumbai', 'NMIMS'],
  'maharashtra|Pune': ['Savitribai Phule Pune University', 'Symbiosis International'],
  'karnataka|Bengaluru': ['Bangalore University', 'Christ University']
};

function $(id) { return document.getElementById(id); }
function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }
function toast(message, isError) {
  var el = $('toast');
  el.textContent = message;
  el.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(function () { el.classList.remove('show'); }, 2800);
}
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value); }
function setError(input, errorId, message) {
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  $(errorId).textContent = message || '';
  return !message;
}
function focusInvalid() {
  var invalid = document.querySelector('.step:not(.hidden) [aria-invalid="true"]');
  if (invalid) invalid.focus();
}
function focusStep(step) {
  var panel = document.querySelector('.step[data-step="' + step + '"]');
  var heading = panel ? panel.querySelector('h1') : null;
  if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
}
function setLoading(button, callback) {
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.classList.add('loading');
  setTimeout(function () {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.classList.remove('loading');
    callback();
  }, 650);
}
function updateProgress(step) {
  var pct = step === 'success' ? 100 : step * 25;
  $('progressBar').style.width = pct + '%';
  $('progressBar').setAttribute('aria-valuenow', String(pct));
  $('progressPercent').textContent = pct + '%';
  $('stepLabel').textContent = step === 'success' ? 'Complete' : 'Step ' + step + ' of 4';
}
function goTo(step) {
  document.querySelectorAll('.step').forEach(function (el) { el.classList.add('hidden'); });
  var target = document.querySelector('.step[data-step="' + step + '"]');
  if (!target) return;
  target.classList.remove('hidden');
  currentStep = step;
  updateProgress(step);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(function () { focusStep(step); }, 0);
}
function validateStep1() {
  var input = $('email'), value = input.value.trim();
  if (!value) return setError(input, 'emailError', 'Email address is required.');
  if (!validEmail(value) || !input.checkValidity()) return setError(input, 'emailError', 'Enter a valid email address.');
  data.email = value;
  setError(input, 'emailError', '');
  $('emailPreview').textContent = value;
  return true;
}
function validateStep2() {
  var input = $('otp'), value = input.value.trim();
  if (!/^\d{6}$/.test(value) || !input.checkValidity()) return setError(input, 'otpError', 'Enter the 6-digit verification code.');
  if (value !== demoOtp) return setError(input, 'otpError', 'That code is incorrect. Try the demo code shown below.');
  setError(input, 'otpError', '');
  return true;
}
function validateStep3() {
  var ok = true;
  var first = $('firstName'), last = $('lastName'), age = $('age'), pronouns = $('pronouns');
  ok = setError(first, 'firstNameError', first.value.trim() ? '' : 'First name is required.') && ok;
  ok = setError(last, 'lastNameError', last.value.trim() ? '' : 'Last name is required.') && ok;
  var ageValue = age.value.trim();
  if (!/^\d+$/.test(ageValue)) ok = setError(age, 'ageError', 'Enter your age using numbers only.') && ok;
  else if (!age.checkValidity() || +ageValue < 18) ok = setError(age, 'ageError', 'You must be 18 or older to continue.') && ok;
  else ok = setError(age, 'ageError', '') && ok;
  ok = setError(pronouns, 'pronounsError', pronouns.value ? '' : 'Please select your pronouns.') && ok;
  if (ok) { data.firstName = first.value.trim(); data.lastName = last.value.trim(); }
  return ok;
}
function validateStep4() {
  var ok = true;
  var state = $('state'), city = $('city'), college = $('college');
  ok = setError(state, 'stateError', state.value ? '' : 'Select a state.') && ok;
  ok = setError(city, 'cityError', city.value ? '' : 'Select a city.') && ok;
  ok = setError(college, 'collegeError', college.value ? '' : 'Select a college.') && ok;
  if (ok && (!state.checkValidity() || !city.checkValidity() || !college.checkValidity())) ok = false;
  return ok;
}
function handleNext(button) {
  var valid = currentStep === 1 ? validateStep1() : currentStep === 2 ? validateStep2() : validateStep3();
  if (!valid) { focusInvalid(); toast('Please check the highlighted fields.', true); return; }
  setLoading(button, function () {
    if (currentStep === 1) toast('Verification code ready — email delivery is simulated for this front-end demo.');
    goTo(Number(button.dataset.next));
  });
}

document.addEventListener('DOMContentLoaded', function () {
  $('startBtn').onclick = function () { show('wizard'); hide('landing'); goTo(1); };
  $('termsBtn').onclick = function () { show('terms'); hide('landing'); $('termsTitle').focus(); };
  $('termsStart').onclick = function () { show('wizard'); hide('terms'); goTo(1); };
  document.querySelectorAll('[data-back]').forEach(function (button) {
    button.onclick = function () { hide(button.closest('.screen').id); show(button.dataset.back); $(button.dataset.back === 'landing' ? 'termsBtn' : 'startBtn').focus(); };
  });
  document.querySelectorAll('.next-btn').forEach(function (button) { button.onclick = function () { handleNext(button); }; });
  $('wizardBack').onclick = function () {
    if (currentStep > 1) goTo(currentStep - 1); else { hide('wizard'); show('landing'); $('startBtn').focus(); }
  };
  $('exitWizard').onclick = function () { hide('wizard'); show('landing'); $('startBtn').focus(); };
  $('email').addEventListener('input', function () {
    var value = this.value.trim(), valid = validEmail(value);
    $('email').parentElement.classList.toggle('valid', valid);
    if (this.getAttribute('aria-invalid') === 'true') setError(this, 'emailError', valid ? '' : 'Enter a valid email address.');
  });
  $('email').addEventListener('blur', validateStep1);
  $('otp').addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 6); });
  $('age').addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 3); });
  ['firstName', 'lastName'].forEach(function (id) { $(id).addEventListener('input', function () { this.value = this.value.replace(/\s{2,}/g, ' '); }); });
  $('state').onchange = function () {
    var city = $('city'), college = $('college');
    city.innerHTML = '<option value="">Select a city</option>';
    college.innerHTML = '<option value="">Select a college</option>';
    college.disabled = true;
    college.required = false;
    college.setAttribute('aria-required', 'false');
    college.setAttribute('aria-disabled', 'true');
    (cities[this.value] || []).forEach(function (name) { city.insertAdjacentHTML('beforeend', '<option>' + name + '</option>'); });
    city.disabled = !this.value;
    city.required = !!this.value;
    city.setAttribute('aria-required', this.value ? 'true' : 'false');
    city.setAttribute('aria-disabled', this.value ? 'false' : 'true');
    city.setAttribute('aria-invalid', 'false');
    college.setAttribute('aria-invalid', 'false');
    $('cityError').textContent = '';
    $('collegeError').textContent = '';
  };
  $('city').onchange = function () {
    var state = $('state').value, college = $('college');
    college.innerHTML = '<option value="">Select a college</option>';
    (colleges[state + '|' + this.value] || []).forEach(function (name) { college.insertAdjacentHTML('beforeend', '<option>' + name + '</option>'); });
    college.disabled = !this.value;
    college.required = !!this.value;
    college.setAttribute('aria-required', this.value ? 'true' : 'false');
    college.setAttribute('aria-disabled', this.value ? 'false' : 'true');
    college.setAttribute('aria-invalid', 'false');
    $('collegeError').textContent = '';
  };
  $('finishBtn').onclick = function () {
    if (!validateStep4()) { focusInvalid(); toast('Please complete your education details.', true); return; }
    setLoading(this, function () { $('successName').textContent = data.firstName || 'there'; goTo('success'); toast('Profile completed successfully!'); });
  };
  $('restartBtn').onclick = function () { location.reload(); };
  $('resendBtn').onclick = function () {
    if (resendSeconds > 0) return;
    resendSeconds = 30;
    $('resendBtn').disabled = true;
    $('resendBtn').setAttribute('aria-disabled', 'true');
    $('resendTimer').textContent = '(30s)';
    toast('Verification code resent — email delivery is simulated for this front-end demo.');
    var timer = setInterval(function () {
      resendSeconds--;
      $('resendTimer').textContent = resendSeconds ? '(' + resendSeconds + 's)' : '';
      if (!resendSeconds) {
        clearInterval(timer);
        $('resendBtn').disabled = false;
        $('resendBtn').setAttribute('aria-disabled', 'false');
      }
    }, 1000);
  };
});
