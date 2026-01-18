/**
 * Core function to rebuild the map layers whenever a toggle changes.
 */
function updateMap() {
    // 1. Get current state of the Year and Base toggles
    const year = document.querySelector('input[name="year"]:checked').value;
    const base = document.querySelector('input[name="base"]:checked').value;
    
    const stack = document.getElementById('map-stack');
    const textureMenu = document.getElementById('texture-details');
    
    // 2. Clear existing layers before rebuilding
    stack.innerHTML = '';

    // 3. Show/Hide texture-specific options in sidebar
    if (base === 'texture') {
        textureMenu.classList.remove('hidden');
    } else {
        textureMenu.classList.add('hidden');
    }

    /**
     * Helper to create and append image layers
     */
    function createLayer(layerName, isLinear, zIndex) {
        const img = document.createElement('img');
        img.src = `assets/${year}_${layerName}.png`;
        img.className = 'layer' + (isLinear ? ' linear-burn' : '');
        img.style.zIndex = zIndex;
        
        // Remove from DOM if the file is missing to prevent broken icons
        img.onerror = () => img.remove();
        
        stack.appendChild(img);
    }

    // --- HIERARCHY (Bottom to Top) ---

    // LEVEL 0: The Base (Satellite or Texture)
    createLayer(base, false, 0);

    // LEVEL 1: Borders
    if (document.querySelector('[data-layer="border"]').checked) {
        createLayer('border', false, 1);
    }

    // LEVEL 2-5: Texture Specific Layers (only if 'Texture' is selected)
    if (base === 'texture') {
        const textureLayers = ['marshes', 'veg', 'water', 'pop'];
        textureLayers.forEach((name, i) => {
            const cb = document.querySelector(`[data-layer="${name}"]`);
            if (cb.checked) {
                const isLinear = cb.hasAttribute('data-blend');
                createLayer(name, isLinear, 2 + i);
            }
        });
    }

    // LEVEL 10-14: Global Layers (Roads, Cities, Rivers, Pumps)
    const globalLayers = ['roads', 'cities', 'rivers', 'pumps'];
    globalLayers.forEach((name, i) => {
        const cb = document.querySelector(`[data-layer="${name}"]`);
        if (cb.checked) {
            createLayer(name, false, 10 + i);
        }
    });

    // LEVEL 50: Marshes Labels (Must be at the very top of map features)
    const marshesCB = document.querySelector('[data-layer="marshes"]');
    if (base === 'texture' && marshesCB.checked) {
        createLayer('marshes_labels', false, 50);
    }

    // LEVEL 100: Legend (Top level UI)
    // Note: This expects assets named 1990_legend.png and 2024_legend.png
    createLayer('legend', false, 100);
}

// Ensure the map renders immediately when the page loads
window.onload = updateMap;