import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDuV0zO-5M4IkpTqzwaWqvL15HCitqaXME",
    authDomain: "megusta-semijoias.firebaseapp.com",
    projectId: "megusta-semijoias",
    storageBucket: "megusta-semijoias.appspot.com",
    messagingSenderId: "998632232244",
    appId: "1:998632232244:web:45473970818b8374e20161"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. Máscara de Moeda R$ 0,00
const inputPreco = document.getElementById('preco');
inputPreco.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    v = (v / 100).toFixed(2).replace(".", ",");
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    e.target.value = "R$ " + v;
});

// 2. Lógica de Nova Categoria
const selectCat = document.getElementById('categoria');
const inputNovaCat = document.getElementById('nova-cat-input');
selectCat.addEventListener('change', () => {
    inputNovaCat.style.display = (selectCat.value === 'nova') ? 'block' : 'none';
});

// 3. Preview Automático ao Colar Link
const inputUrl = document.getElementById('url-img');
const previewImg = document.getElementById('img-preview');
const placeholder = document.getElementById('placeholder-text');

inputUrl.addEventListener('input', (e) => {
    const url = e.target.value;
    if (url.startsWith('http')) {
        previewImg.src = url;
        previewImg.style.display = 'block';
        placeholder.style.display = 'none';
    } else {
        previewImg.style.display = 'none';
        placeholder.style.display = 'block';
    }
});

// 4. Salvar Produto
document.getElementById('form-produto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    
    btn.disabled = true;
    btn.innerText = "SALVANDO...";

    const categoriaFinal = (selectCat.value === 'nova') ? inputNovaCat.value.toLowerCase() : selectCat.value;

    try {
        await addDoc(collection(db, "produtos"), {
            nome: document.getElementById('nome').value,
            categoria: categoriaFinal,
            preco: inputPreco.value,
            estoque: parseInt(document.getElementById('estoque').value),
            imagens: [inputUrl.value], // Salva o link do Postimages
            dataCriacao: serverTimestamp()
        });

        alert("PRODUTO CADASTRADO COM SUCESSO!");
        location.reload();
    } catch (err) {
        alert("Erro ao salvar! Verifique sua conexão.");
        console.error(err);
        btn.disabled = false;
        btn.innerText = "CADASTRAR PRODUTO";
    }
});