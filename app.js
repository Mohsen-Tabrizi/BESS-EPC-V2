(function(){
  const toggle = document.getElementById('lang-toggle');
  const nodes = document.querySelectorAll('[data-de],[data-en]');
  let lang = 'de'; // start in DE since your screenshots show German
  function render(){ nodes.forEach(n => n.innerHTML = n.getAttribute('data-'+lang)); }
  if (toggle){
    toggle.addEventListener('click', () => {
      lang = (lang==='de' ? 'en' : 'de');
      toggle.innerText = (lang==='de' ? 'EN' : 'DE');
      render();
    });
  }
  render();
})();
