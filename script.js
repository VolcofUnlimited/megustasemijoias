import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
let usuarioAtual = null;

onAuthStateChanged(auth, async (user) => {
    const info = document.getElementById('user-info');
    const btnL = document.getElementById('btn-logout');
    if (user) {
        usuarioAtual = user;
        info.innerText = "OLÁ, " + (user.displayName || user.email).toUpperCase();
        btnL.style.display = "inline";
        const cartDoc = await getDoc(doc(db, "carrinhos", user.uid));
        if (cartDoc.exists()) carrinho = cartDoc.data().itens || [];
    } else {
        usuarioAtual = null;
        carrinho = JSON.parse(localStorage.getItem('megu-carrinho')) || [];
        info.innerHTML = '<a href="login.html" style="color:#D1BE9C; text-decoration:none; font-weight:700;">ENTRAR OU CADASTRAR</a>';
        btnL.style.display = "none";
    }
    atualizarContador();
});

async function salvarCarrinho() {
    if (usuarioAtual) await setDoc(doc(db, "carrinhos", usuarioAtual.uid), { itens: carrinho });
    else localStorage.setItem('megu-carrinho', JSON.stringify(carrinho));
}

onSnapshot(query(colRef, orderBy("dataCriacao", "desc")), (snapshot) => {
    const grade = document.getElementById('lista-produtos');
    if(!grade) return;
    produtosAtuais = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    grade.innerHTML = "";
    produtosAtuais.forEach(p => {
        const esgotado = p.estoque <= 0;
        grade.innerHTML += `
            <div class="card ${p.categoria}" onclick="${esgotado ? '' : `window.abrirModal('${p.id}')`}" style="opacity: ${esgotado ? '0.6' : '1'}">
                <img src="${p.imagens[0]}">
                <p class="nome-produto">${p.nome}</p>
                <span class="preco-produto">${esgotado ? 'ESGOTADO' : p.preco}</span>
            </div>`;
    });
});

window.abrirModal = (id) => {
    const p = produtosAtuais.find(prod => prod.id === id);
    if(!p) return;
    document.getElementById('tituloModal').innerText = p.nome;
    document.getElementById('precoModal').innerText = p.preco;
    document.getElementById('descModal').innerText = p.descricao;
    document.querySelector('.img-modal-container').innerHTML = `<img id="imgModal" src="${p.imagens[0]}">`;
    
    document.getElementById('btnAdicionarAoCarrinho').onclick = async () => {
        let ex = carrinho.find(item => item.nome === p.nome);
        if (ex) ex.quantidade++; 
        else carrinho.push({ nome: p.nome, preco: p.preco, imagem: p.imagens[0], quantidade: 1 });
        await salvarCarrinho();
        atualizarContador(); 
        window.fecharModal();
    };
    document.getElementById('meuModal').style.display = "block";
};

window.filtrar = (cat) => {
    const titulo = document.getElementById('nome-categoria-atual');
    if(titulo) titulo.innerText = cat === 'todos' ? "TODOS OS PRODUTOS" : cat.toUpperCase();
    document.querySelectorAll('.card').forEach(card => {
        card.style.display = (cat === 'todos' || card.classList.contains(cat)) ? "block" : "none";
    });
};

function atualizarContador() {
    let total = carrinho.reduce((s, i) => s + i.quantidade, 0);
    const c = document.getElementById('contagem-carrinho');
    if(c) c.innerText = total;
}

window.fecharModal = () => document.getElementById('meuModal').style.display = "none";
window.logout = () => signOut(auth).then(() => { localStorage.removeItem('megu-carrinho'); window.location.reload(); });
const btnLogoutEl = document.getElementById('btn-logout');
if(btnLogoutEl) btnLogoutEl.onclick = window.logout;