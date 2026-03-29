import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 1. Configuração Oficial do Firebase Megusta
const firebaseConfig = {
    apiKey: "AIzaSyDuV0zO-5M4IkpTqzwaWqvL15HCitqaXME",
    authDomain: "megusta-semijoias.firebaseapp.com",
    projectId: "megusta-semijoias",
    storageBucket: "megusta-semijoias.firebasestorage.app",
    messagingSenderId: "998632232244",
    appId: "1:998632232244:web:45473970818b8374e20161"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const colRef = collection(db, "produtos");

let carrinho = [];
let produtosAtuais = [];

// 2. Controle de Usuário e Carrinho
onAuthStateChanged(auth, async (user) => {
    const info = document.getElementById('user-info');
    if (user) {
        if(info) info.innerText = "OLÁ, " + (user.displayName || "CLIENTE").toUpperCase();
        const cartDoc = await getDoc(doc(db, "carrinhos", user.uid));
        if (cartDoc.exists()) carrinho = cartDoc.data().itens || [];
    } else {
        if(info) info.innerHTML = '<a href="login.html" style="color:#D1BE9C; text-decoration:none;">ENTRAR</a>';
        carrinho = JSON.parse(localStorage.getItem('megu-carrinho')) || [];
    }
    atualizarContador();
});

// 3. Carregamento da Vitrine em Tempo Real
onSnapshot(query(colRef, orderBy("dataCriacao", "desc")), (snapshot) => {
    const grade = document.getElementById('lista-produtos');
    if(!grade) return;
    
    produtosAtuais = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    grade.innerHTML = "";

    produtosAtuais.forEach(p => {
        const esgotado = p.estoque <= 0;
        // Criamos o card com a classe da categoria para o filtro funcionar
        grade.innerHTML += `
            <div class="card ${p.categoria.toLowerCase()}" onclick="${esgotado ? '' : `window.abrirModal('${p.id}')`}" style="opacity: ${esgotado ? '0.6' : '1'}">
                <img src="${p.imagens[0]}" alt="${p.nome}">
                <p class="nome-produto">${p.nome.toUpperCase()}</p>
                <span class="preco-produto">${esgotado ? 'ESGOTADO' : p.preco}</span>
            </div>`;
    });
});

// 4. FUNÇÃO DE FILTRO (Ajuste conforme a imagem de referência)
window.filtrar = (cat) => {
    const tituloH1 = document.getElementById('nome-categoria-atual');
    
    if (tituloH1) {
        // Altera o texto do H1 para a categoria em MAIÚSCULO (ex: BRINCOS)
        tituloH1.innerText = (cat === 'todos') ? "TODOS OS PRODUTOS" : cat.toUpperCase();
    }

    // Lógica visual de esconder/mostrar os cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (cat === 'todos' || card.classList.contains(cat.toLowerCase())) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });

    // Rola para o topo para destacar o novo título
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 5. Funções do Modal (Mantendo sua estrutura original)
window.abrirModal = (id) => {
    const p = produtosAtuais.find(prod => prod.id === id);
    if(!p) return;

    document.getElementById('tituloModal').innerText = p.nome.toUpperCase();
    document.getElementById('precoModal').innerText = p.preco;
    document.getElementById('descModal').innerText = p.descricao;
    
    const containerImg = document.querySelector('.img-modal-container');
    if(containerImg) containerImg.innerHTML = `<img src="${p.imagens[0]}" style="width:100%">`;
    
    document.getElementById('meuModal').style.display = "block";
};

window.fecharModal = () => {
    document.getElementById('meuModal').style.display = "none";
};

// 6. Atualização do ícone da Sacola
function atualizarContador() {
    let total = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    const contador = document.getElementById('contagem-carrinho');
    if(contador) contador.innerText = total;
}

// Fechar modal ao clicar fora dele
window.onclick = (event) => {
    const modal = document.getElementById('meuModal');
    if (event.target == modal) modal.style.display = "none";
};