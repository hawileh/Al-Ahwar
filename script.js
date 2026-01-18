// 1. List all assets to preload
const years = ['1990', '2024'];
const baseLayers = ['satellite', 'texture'];
const otherLayers = ['border', 'marshes', 'veg', 'water', 'pop', 'roads', 'cities', 'rivers', 'pumps', 'marshes_labels', 'legend'];

const allImagePaths = [];
years.forEach(y => {
    baseLayers.forEach(b => allImagePaths.push(`assets/${y}_${b}.png`));
    otherLayers.forEach(l => allImagePaths.push(`assets/${y}_${l}.png`));
});

let loadedCount = 0;
const totalImages = allImagePaths.length;

// 2. Preload Logic
function preloadAll() {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    allImagePaths.forEach(path => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            loadedCount++;
            const percentage = Math.floor((loadedCount / totalImages) * 100);
            progressBar.style.width = percentage + '%';
            progressText.innerText = percentage + '%';

            if (loadedCount === totalImages) {
                revealSite();
            }
        };
        img.onerror = () => {
            // If an image is missing, we still increment to prevent the loader from getting stuck
            loadedCount++;
            if (loadedCount === totalImages) revealSite();
        };
    });
}

function revealSite() {
    const loader = document.getElementById('loader-overlay');
    const mainApp = document.getElementById('main-app');
    
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
        mainApp.style.visibility = 'visible';
        updateMap(); // Initial draw
    }, 800);
}

// 3. Map Update Logic (Same as before but cleaned up)
function updateMap() {
    const year = document.querySelector('input[name="year"]:checked').value;
    const base = document.querySelector('input[name="base"]:checked').value;
    const stack = document.getElementById('map-stack');
    const textureMenu = document.getElementById('texture-details');
    
    stack.innerHTML = '';

    if (base === 'texture') {
        textureMenu.classList.remove('hidden');
    } else {
        textureMenu.classList.add('hidden');
    }

    function createLayer(layerName, isLinear, zIndex) {
        const img = document.createElement('img');
        img.src = `assets/${year}_${layerName}.png`;
        img.className = 'layer' + (isLinear ? ' linear-burn' : '');
        img.style.zIndex = zIndex;
        stack.appendChild(img);
    }

    // --- Z-INDEX STACKING ---
    createLayer(base, false, 0); // Base
    if (document.querySelector('[data-layer="border"]').checked) createLayer('border', false, 1);

    if (base === 'texture') {
        const texLayers = ['marshes', 'veg', 'water', 'pop'];
        texLayers.forEach((name, i) => {
            const cb = document.querySelector(`[data-layer="${name}"]`);
            if (cb.checked) createLayer(name, cb.hasAttribute('data-blend'), 2 + i);
        });
    }

    const globals = ['roads', 'cities', 'rivers', 'pumps'];
    globals.forEach((name, i) => {
        if (document.querySelector(`[data-layer="${name}"]`).checked) createLayer(name, false, 10 + i);
    });

    if (base === 'texture' && document.querySelector('[data-layer="marshes"]').checked) {
        createLayer('marshes_labels', false, 50);
    }

    createLayer('legend', false, 100);
}

// Start preloading immediately
window.onload = preloadAll;