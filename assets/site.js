const SUPABASE_URL = 'https://rwehkhhvqfnbzhqoveuj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_pCQuzQMVaZiT2fkrzvPfpA_mXz9rYNa';
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const submitButton = contactForm.querySelector('button[type="submit"]');

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formStatus.classList.remove('error');

  if (SUPABASE_URL.startsWith('YOUR_') || SUPABASE_PUBLISHABLE_KEY.startsWith('YOUR_')) {
    formStatus.textContent = 'Supabase সংযোগ সম্পূর্ণ করতে Project URL ও Publishable key সেট করতে হবে।';
    formStatus.classList.add('error');
    return;
  }

  if (!window.supabase?.createClient) {
    formStatus.textContent = 'Supabase লাইব্রেরি লোড হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।';
    formStatus.classList.add('error');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'পাঠানো হচ্ছে…';
  formStatus.textContent = '';
  try {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { error } = await client.from('contact_requests').insert({
      name: contactForm.elements.name.value.trim(),
      email: contactForm.elements.email.value.trim(),
      service: contactForm.elements.service.value,
      message: contactForm.elements.message.value.trim()
    });
    if (error) throw error;
    contactForm.reset();
    formStatus.textContent = 'ধন্যবাদ! আপনার বার্তা সফলভাবে জমা হয়েছে।';
  } catch (error) {
    console.error('Supabase contact form error:', error);
    formStatus.textContent = 'বার্তা জমা হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।';
    formStatus.classList.add('error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'বার্তা পাঠান ↗';
  }
});
