// Sélection des éléments du formulaire
const imageFileInput = document.querySelector('#imageFileInput');
const topTextInput = document.querySelector('#topTextInput');
const bottomTextInput = document.querySelector('#bottomTextInput');
const canvas = document.querySelector('#meme');
const downloadBtn = document.querySelector('#downloadBtn');
const shareBtn = document.querySelector('#shareBtn');
const saveBtn = document.querySelector('#saveBtn');

let image; // Variable pour stocker l'image chargée
let savedMemes = []; // Tableau pour stocker les memes sauvegardés

// Charger les memes sauvegardés depuis localStorage au démarrage
function loadSavedMemes() {
    try {
        const stored = localStorage.getItem('savedMemes');
        if (stored) {
            savedMemes = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des memes:', error);
        savedMemes = [];
    }
}

// Sauvegarder les memes dans localStorage
function saveMemeToStorage() {
    try {
        localStorage.setItem('savedMemes', JSON.stringify(savedMemes));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde du meme');
    }
}

// Écouteur pour le changement d'image
imageFileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
        const imageDataUrl = URL.createObjectURL(e.target.files[0]);

        image = new Image();
        image.src = imageDataUrl;

        image.addEventListener("load", () => {
            updateMemeCanvas(canvas, image, topTextInput.value, bottomTextInput.value);
        }, { once: true });
    }
});

// Écouteurs pour les textes
topTextInput.addEventListener("input", () => {
    if (image) {
        updateMemeCanvas(canvas, image, topTextInput.value, bottomTextInput.value);
    }
});

bottomTextInput.addEventListener("input", () => {
    if (image) {
        updateMemeCanvas(canvas, image, topTextInput.value, bottomTextInput.value);
    }
});

// Fonction pour mettre à jour le canvas avec l'image et les textes
function updateMemeCanvas(canvas, image, topText, bottomText) {
    const ctx = canvas.getContext("2d");
    const width = image.width;
    const height = image.height;
    
    // Taille de police basée sur la largeur de l'image
    const fontSize = Math.floor(width / 20);
    // Marge verticale
    const yOffset = height / 10;
    
    // Définit la taille du canvas
    canvas.width = width;
    canvas.height = height;
    
    // Dessine l'image
    ctx.drawImage(image, 0, 0, width, height);

    // Style du texte
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = Math.max(Math.floor(fontSize / 8), 2);
    ctx.textAlign = 'center';
    ctx.lineJoin = "round";
    ctx.font = `bold ${fontSize}px Impact, Arial, sans-serif`;

    // Texte du haut
    if (topText) {
        ctx.textBaseline = "top";
        ctx.strokeText(topText, width / 2, yOffset);
        ctx.fillText(topText, width / 2, yOffset);
    }
    
    // Texte du bas
    if (bottomText) {
        ctx.textBaseline = "bottom";
        const textY = height - yOffset;
        ctx.strokeText(bottomText, width / 2, textY);
        ctx.fillText(bottomText, width / 2, textY);
    }
}

// Fonction pour télécharger le meme
downloadBtn.addEventListener('click', () => {
    if (!image) {
        alert("Veuillez d'abord sélectionner une image");
        return;
    }

    const link = document.createElement('a');
    link.download = 'mon-meme.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Écouteur pour le bouton sauvegarder séparé
saveBtn.addEventListener('click', () => {
    if (!image) {
        alert("Veuillez d'abord sélectionner une image");
        return;
    }
    saveMemeToGallery();
    alert("Meme sauvegardé dans la galerie !");
});

// Fonction pour sauvegarder le meme dans la galerie
function saveMemeToGallery() {
    const memeData = {
        id: Date.now(), // ID unique pour chaque meme
        dataUrl: canvas.toDataURL('image/png'),
        topText: topTextInput.value,
        bottomText: bottomTextInput.value,
        timestamp: new Date().toLocaleString()
    };
    savedMemes.push(memeData);
    saveMemeToStorage(); 
    updateGalerie();
}

// Fonction pour supprimer un meme de la galerie
function deleteMeme(memeId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce meme ?')) {
        savedMemes = savedMemes.filter(meme => meme.id !== memeId);
        saveMemeToStorage(); // Mettre à jour localStorage
        updateGalerie();
    }
}

// Fonction pour télécharger un meme sauvegardé
function downloadSavedMeme(dataUrl, index) {
    const link = document.createElement('a');
    link.download = `meme-${index}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Fonction pour partager sur les réseaux
shareBtn.addEventListener('click', async () => {
    if (!image) {
        alert("Veuillez d'abord créer un meme");
        return;
    }

    // Convertir le canvas en blob
    canvas.toBlob(async (blob) => {
        const file = new File([blob], 'mon-meme.png', { type: 'image/png' });
        
        // Vérifier si l'API Web Share est disponible
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mon Meme Génial',
                    text: 'Regardez ce meme que j\'ai créé!',
                    files: [file]
                });
            } catch (error) {
                console.error('Erreur de partage:', error);
                // Fallback si le partage échoue
                downloadMemeAsFallback();
            }
        } else {
            // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
            downloadMemeAsFallback();
        }
    }, 'image/png');
});

// Fallback pour le téléchargement
function downloadMemeAsFallback() {
    const link = document.createElement('a');
    link.download = 'mon-meme.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("L'image a été téléchargée. Vous pouvez la partager depuis votre galerie!");
}

// Fonction pour mettre à jour la galerie
function updateGalerie() {
    const galerieContainer = document.getElementById('galerieContainer');
    galerieContainer.innerHTML = '';

    if (savedMemes.length === 0) {
        galerieContainer.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Aucun meme sauvegardé pour le moment.</p>';
        return;
    }

    savedMemes.forEach((meme, index) => {
        const memeItem = document.createElement('div');
        memeItem.className = 'galerie-item';
        memeItem.innerHTML = `
            <img src="${meme.dataUrl}" alt="Meme ${index + 1}" style="max-width: 100%; border-radius: 4px; margin-bottom: 10px;">
            <p><strong>Haut:</strong> ${meme.topText || 'Aucun'}</p>
            <p><strong>Bas:</strong> ${meme.bottomText || 'Aucun'}</p>
            <p><small style="color: #666;">${meme.timestamp}</small></p>
            <div style="margin-top: 10px; display: flex; gap: 5px; justify-content: center;">
                <button onclick="downloadSavedMeme('${meme.dataUrl}', ${index + 1})" 
                        style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">
                    Télécharger
                </button>
                <button onclick="deleteMeme(${meme.id})" 
                        style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">
                    Supprimer
                </button>
            </div>
        `;
        galerieContainer.appendChild(memeItem);
    });
}

// Gestion des menus de navigation
function switchMenu(menuName) {
    // Mettre à jour les boutons
    document.querySelectorAll('.menu-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');

    // Cacher toutes les sections
    document.getElementById('memeSection').style.display = 'none';
    document.getElementById('galerieSection').style.display = 'none';

    // Afficher la section sélectionnée
    if (menuName === 'meme') {
        document.getElementById('memeSection').style.display = 'block';
    } else if (menuName === 'galerie') {
        document.getElementById('galerieSection').style.display = 'block';
        updateGalerie();
    }
}


// Initialiser l'application au chargement
document.addEventListener('DOMContentLoaded', () => {
    loadSavedMemes(); // Charger les memes sauvegardés
    updateGalerie();
    
});

