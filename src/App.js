import React, { useState, useEffect, useMemo } from 'react';

// Importações do Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, where, Timestamp, getDocs, doc, deleteDoc, setLogLevel } from 'firebase/firestore';

// --- Configuração do Firebase ---
// Suas configurações do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCWuk_ZjF47pQKQdT85puf7FZdS9O9PY0Q",
    authDomain: "barbearia-ed66e.firebaseapp.com",
    projectId: "barbearia-ed66e",
    storageBucket: "barbearia-ed66e.appspot.com",
    messagingSenderId: "359234846115",
    appId: "1:359234846115:web:c801ff3d64c5ffb5b0ae16",
    measurementId: "G-BW1Z3XSMVH"
};

const appId = 'default-app-id';

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('debug');

// --- Ícones SVG como Componentes ---
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-4.5 12h27" /></svg>);
const ChartBarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>);
const CogIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0H3.75m16.5 0h-1.5m-1.5 0a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);
const ScissorsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l-1.362 1.362a1.125 1.125 0 1 1-1.591-1.591L6.25 6.75l1.591 1.5ZM16.5 13.5l1.362-1.362a1.125 1.125 0 0 0-1.591-1.591L15 11.25l-1.591-1.5ZM12 15a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm0 0v-5.113c0-.34.162-.663.431-.862l3.488-2.616a1.125 1.125 0 0 1 1.28.21l1.06 1.06a1.125 1.125 0 0 1-.21 1.28l-2.616 3.488a1.125 1.125 0 0 1-.862.431V15Zm-4.5 0a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0Zm0 0V9.887c0-.34-.162-.663-.431-.862L4.453 6.409a1.125 1.125 0 0 0-1.28.21L2.113 7.68a1.125 1.125 0 0 0 .21 1.28l2.616 3.488a1.125 1.125 0 0 0 .862.431V15Z" /></svg>);
const UserPlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>);
const XCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);
const PixIcon = () => (<svg className="w-4 h-4 inline-block ml-2 text-slate-500" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M211.4 90.31a8 8 0 0 0-11.4 5.69l-13.78 61.16-41.13-35.34a8 8 0 0 0-10.18 12.38l42.14 36.21-22.18 20.27a8 8 0 0 0 10.74 11.82l23.5-21.48 3.86 17.15a8 8 0 0 0 15.72-3.52l-5.63-25a8 8 0 0 0-9.84-6.5l-25 5.63a8 8 0 0 0-3.52 15.72l11.75 2.62 13-11.87-42.14-36.21a8 8 0 0 0-10.18 12.38l21.6 18.57-22.18 20.27a8 8 0 0 0 10.74 11.82L156.69 181l-14.8 13.52a8 8 0 0 0 10.74 11.82l16.12-14.73 3.86 17.15a8 8 0 0 0 15.72-3.52l-5.63-25a8 8 0 0 0-9.84-6.5l-25 5.63a8 8 0 1 0-3.52 15.72l11.75 2.62 25.41-23.22a8 8 0 0 0 .54-11.28Z"/><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z"/></svg>);
const QrCodeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block ml-1 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 0 1 4.5 3.75h3.75a.75.75 0 0 1 0 1.5H5.25v2.25a.75.75 0 0 1-1.5 0V4.5Zm0 15a.75.75 0 0 1 .75-.75h2.25v-1.5a.75.75 0 0 1 1.5 0v2.25a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75Zm15.75-15a.75.75 0 0 1-.75.75h-2.25v2.25a.75.75 0 0 1-1.5 0V4.5a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 .75.75ZM19.5 19.5a.75.75 0 0 1-.75.75h-3.75a.75.75 0 0 1 0-1.5h2.25v-2.25a.75.75 0 0 1 1.5 0v3.75ZM8.25 8.25h.01M9.75 9.75h.01M9.75 12.75h.01M8.25 15.75h.01M12.75 8.25h.01M11.25 11.25h.01M11.25 14.25h.01M15.75 9.75h.01M14.25 12.75h.01M15.75 15.75h.01" /></svg>);
const BarberIcon = () => ( <svg className="w-9 h-9 mr-3 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"> <circle cx="6" cy="6" r="3" /> <circle cx="6" cy="18" r="3" /> <line x1="20" y1="4" x2="8.12" y2="15.88" /> <line x1="14.47" y1="14.48" x2="20" y2="20" /> <line x1="8.12" y1="8.12" x2="12" y2="12" /> </svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);

// --- Componentes da UI ---
const formatCurrency = (value) => (typeof value === 'number') ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

const AuthPage = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // onAuthSuccess será chamado pelo listener onAuthStateChanged
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center items-center mb-4">
                        <BarberIcon />
                        <h1 className="text-3xl font-bold text-slate-900">Barbers Brothers</h1>
                    </div>
                    <p className="text-slate-600">{isLogin ? 'Faça login para continuar' : 'Crie a sua conta'}</p>
                </div>
                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Palavra-passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-lg hover:bg-slate-900 transition shadow-md disabled:bg-slate-400">
                        {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Registar')}
                    </button>
                </form>
                <p className="text-sm text-center text-slate-600">
                    {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-slate-800 hover:underline ml-1">
                        {isLogin ? 'Registe-se' : 'Faça login'}
                    </button>
                </p>
            </div>
        </div>
    );
};


const Header = () => ( <header className="text-center mb-8">
    <div className="flex justify-center items-center">
        <BarberIcon />
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Barbers Brothers</h1>
    </div>
    <p className="text-slate-600 mt-2">Painel de controle e relatórios financeiros.</p>
</header>);

const Navigation = ({ activePage, setActivePage }) => {
    const navItems = [
        { id: 'dashboard', label: 'Painel Diário', icon: <CalendarIcon/> },
        { id: 'reports', label: 'Relatórios', icon: <ChartBarIcon/> },
        { id: 'admin', label: 'Admin', icon: <CogIcon/> },
    ];
    return (
        <nav className="flex justify-center items-center bg-white p-2 rounded-xl shadow-md mb-8 max-w-lg mx-auto">
            {navItems.map(item => (
                <button key={item.id} onClick={() => setActivePage(item.id)} className={`nav-btn flex-1 text-center py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${activePage === item.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                    {item.icon} {item.label}
                </button>
            ))}
        </nav>
    );
};

const DashboardPage = ({ barbers, serviceTypes, onFinalizeOrder }) => {
    const [selectedBarberId, setSelectedBarberId] = useState(null);
    const [currentServices, setCurrentServices] = useState([]);
    
    const selectedBarber = barbers.find(b => b.id === selectedBarberId);
    
    const handleSelectBarber = (barberId) => {
        if (selectedBarberId !== barberId) {
            setSelectedBarberId(barberId);
            setCurrentServices([]);
        }
    };
    
    const handleAddService = (service) => {
        if (!selectedBarberId) {
            console.warn("Selecione um barbeiro antes de adicionar um serviço.");
            return;
        }
        setCurrentServices(prev => [...prev, service]);
    };
    
    const handleRemoveService = (indexToRemove) => {
        setCurrentServices(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleClearOrder = () => {
        setSelectedBarberId(null);
        setCurrentServices([]);
    };
    
    const handleFinalize = () => {
        if (selectedBarber && currentServices.length > 0) {
            onFinalizeOrder({
                barber: selectedBarber,
                services: currentServices,
                total: orderTotal,
            }, handleClearOrder); // Passando a função para limpar o painel
        }
    };
    
    const orderTotal = useMemo(() => currentServices.reduce((total, s) => total + s.price, 0), [currentServices]);

    return (
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 fade-in">
            {/* Coluna de Seleção */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-lg">
                 <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-slate-800">Lançamento Rápido</h2>
                 <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-slate-700 mb-2">1. Selecione o Barbeiro</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {barbers.map(barber => (
                                <button key={barber.id} onClick={() => handleSelectBarber(barber.id)} className={`p-3 rounded-lg text-center font-semibold transition-all ${selectedBarberId === barber.id ? 'bg-slate-800 text-white ring-2 ring-offset-2 ring-slate-500' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
                                    {barber.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className={`font-semibold mb-2 ${selectedBarberId ? 'text-slate-700' : 'text-slate-400'}`}>2. Adicione os Serviços</h3>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {serviceTypes.map(service => (
                                <button key={service.id} onClick={() => handleAddService(service)} disabled={!selectedBarberId} className={`p-3 rounded-lg text-left transition-all ${!selectedBarberId ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95'}`}>
                                    <p className="font-semibold">{service.name}</p>
                                    <p className="text-sm opacity-80">{formatCurrency(service.price)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>
            </div>

            {/* Coluna da Comanda/Calculadora */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-slate-800">Comanda Atual</h2>
                { !selectedBarber ? (
                    <div className="flex items-center justify-center h-full text-slate-500">Selecione um barbeiro para iniciar.</div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="mb-4">
                            <p className="text-lg"><span className="font-semibold text-slate-700">Barbeiro:</span> <span className="text-slate-800 font-bold">{selectedBarber.name}</span></p>
                        </div>
                        <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                             {currentServices.length === 0 ? (
                                <p className="text-slate-500">Adicione serviços à comanda.</p>
                             ) : (
                                currentServices.map((service, index) => (
                                    <div key={index} className="bg-slate-100 p-2 rounded-lg flex justify-between items-center">
                                        <span className="text-slate-700">{service.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-800">{formatCurrency(service.price)}</span>
                                            <button onClick={() => handleRemoveService(index)} className="text-red-400 hover:text-red-600"><XCircleIcon/></button>
                                        </div>
                                    </div>
                                ))
                             )}
                        </div>
                        <div className="border-t pt-4 mt-4 space-y-4">
                            <div className="flex justify-between items-center text-2xl font-bold text-slate-800">
                                <span>Total:</span>
                                <span>{formatCurrency(orderTotal)}</span>
                            </div>
                             <button onClick={handleFinalize} disabled={currentServices.length === 0 || (!selectedBarber.pixKey && !selectedBarber.pixQRCodeUrl)} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed">
                                Finalizar e Pagar
                            </button>
                            {(!selectedBarber.pixKey && !selectedBarber.pixQRCodeUrl) && currentServices.length > 0 && <p className="text-xs text-center text-red-600">Barbeiro sem PIX cadastrado.</p>}
                            <button onClick={handleClearOrder} className="w-full bg-slate-200 text-slate-700 font-bold py-2 rounded-lg hover:bg-slate-300 transition">
                                Limpar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

const AdminLoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Credenciais pré-definidas. Altere aqui se desejar.
        if (username === 'admin' && password === 'senha123') {
            onLoginSuccess();
            setError('');
        } else {
            setError('Usuário ou senha inválidos.');
        }
    };

    return (
        <div className="flex justify-center items-center fade-in">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Acesso Administrativo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Usuário</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-lg hover:bg-slate-900 transition shadow-md">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};


const AdminPage = ({ barbers, onAddBarber, onDeleteBarber, serviceTypes, onAddServiceType, onDeleteServiceType, onLogout }) => {
    const [barberName, setBarberName] = useState('');
    const [pixKey, setPixKey] = useState('');
    const [pixQRCodeUrl, setPixQRCodeUrl] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [servicePrice, setServicePrice] = useState('');

    const handleAddBarberSubmit = (e) => {
        e.preventDefault();
        if (barberName.trim()) {
            onAddBarber({
                name: barberName.trim(),
                pixKey: pixKey.trim(),
                pixQRCodeUrl: pixQRCodeUrl.trim()
            });
            setBarberName('');
            setPixKey('');
            setPixQRCodeUrl('');
        }
    };

    const handleAddServiceSubmit = (e) => { e.preventDefault(); const price = parseFloat(servicePrice); if (serviceName.trim() && !isNaN(price)) { onAddServiceType({ name: serviceName.trim(), price }); setServiceName(''); setServicePrice(''); } };
    
    return (
        <div className="fade-in">
             <div className="flex justify-end mb-4">
                <button onClick={onLogout} className="flex items-center bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition shadow">
                    <LogoutIcon />
                    Sair
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2 flex items-center text-slate-800"><UserPlusIcon/>Gerenciar Barbeiros</h2>
                    <form onSubmit={handleAddBarberSubmit} className="space-y-3 mb-6">
                        <input type="text" value={barberName} onChange={e => setBarberName(e.target.value)} placeholder="Nome do Barbeiro" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" required />
                        <input type="text" value={pixKey} onChange={e => setPixKey(e.target.value)} placeholder="Chave PIX (Copia e Cola)" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" />
                        <input type="url" value={pixQRCodeUrl} onChange={e => setPixQRCodeUrl(e.target.value)} placeholder="Link da Imagem do QR Code" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" />
                        <button type="submit" className="w-full bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-900 shadow">Adicionar Barbeiro</button>
                    </form>
                    <div className="space-y-2">
                        {barbers.map(barber => (
                            <div key={barber.id} className="bg-slate-100 p-3 rounded-lg flex justify-between items-center">
                               <div className="flex items-center">
                                    <span className="font-medium text-slate-800">{barber.name}</span>
                                    {barber.pixKey && <PixIcon />}
                                    {barber.pixQRCodeUrl && <QrCodeIcon />}
                               </div>
                               <button onClick={() => onDeleteBarber(barber.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><TrashIcon/></button>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2 flex items-center text-slate-800"><ScissorsIcon/>Gerenciar Serviços</h2>
                    <form onSubmit={handleAddServiceSubmit} className="space-y-3 mb-6">
                        <input type="text" value={serviceName} onChange={e => setServiceName(e.target.value)} placeholder="Nome do Serviço" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
                        <input type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)} placeholder="Preço (R$)" step="0.01" min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
                        <button type="submit" className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-lg hover:bg-emerald-700 shadow">Adicionar Serviço</button>
                    </form>
                    <div className="space-y-2">
                        {serviceTypes.map(service => (
                            <div key={service.id} className="bg-slate-100 p-3 rounded-lg flex justify-between items-center">
                               <div>
                                    <p className="font-medium text-slate-800">{service.name}</p>
                                    <p className="text-sm text-slate-600">{formatCurrency(service.price)}</p>
                               </div>
                               <button onClick={() => onDeleteServiceType(service.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><TrashIcon/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportsPage = ({ barbers, dailyServices, dailyTotal }) => {
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const formatDate = (timestamp) => timestamp.toDate().toLocaleDateString('pt-BR');
    
    const servicesCollectionRef = useMemo(() => {
        const user = auth.currentUser;
        if (!user || !appId) return null;
        return collection(db, `artifacts/${appId}/users/${user.uid}/services`);
    }, []);

    const handleGenerateReport = async (e) => {
        e.preventDefault(); 
        if (!servicesCollectionRef) {
            setError('Não foi possível aceder à base de dados.');
            return;
        }
        setIsLoading(true); setError(''); setReportData(null);
        const startDateStr = e.target.elements.reportStartDate.value;
        const endDateStr = e.target.elements.reportEndDate.value;
        if (!startDateStr || !endDateStr) { setError('Por favor, selecione as datas de início e fim.'); setIsLoading(false); return; }
        const startDate = new Date(startDateStr); startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endDateStr); endDate.setHours(23, 59, 59, 999);
        const reportQuery = query(servicesCollectionRef, where('createdAt', '>=', Timestamp.fromDate(startDate)), where('createdAt', '<=', Timestamp.fromDate(endDate)));
        try {
            const querySnapshot = await getDocs(reportQuery);
            const services = []; querySnapshot.forEach(doc => services.push({ id: doc.id, ...doc.data() }));
            services.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
            let totalRevenue = 0; const revenueByBarber = {}; const barbersMap = barbers.reduce((acc, b) => ({ ...acc, [b.id]: b.name }), {});
            services.forEach(service => { totalRevenue += service.value; const barberName = barbersMap[service.barberId] || 'Desconhecido'; revenueByBarber[barberName] = (revenueByBarber[barberName] || 0) + service.value; });
            setReportData({ services, totalRevenue, revenueByBarber, barbersMap });
        } catch (err) { console.error("Erro ao gerar relatório:", err); setError('Ocorreu um erro ao buscar os dados.');
        } finally { setIsLoading(false); }
    };
    return (
        <div className="fade-in space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-slate-800">Serviços de Hoje</h2>
                <div className="space-y-3 overflow-y-auto max-h-96 pr-2">
                    {dailyServices.length === 0 ? ( <p className="text-slate-500 text-center mt-8">Nenhum serviço registrado hoje.</p> ) : (
                        dailyServices.map(service => (
                            <div key={service.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div className="flex justify-between items-center">
                                    <div> <p className="font-semibold text-slate-800">{service.description}</p> <p className="text-sm text-slate-600">Por: {service.barberName}</p> </div>
                                    <p className="font-bold text-lg text-emerald-700">{formatCurrency(service.value)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-6 border-t pt-4 text-right"> <p className="text-lg text-slate-600">Total de Hoje:</p> <p className="text-3xl font-bold text-slate-900">{formatCurrency(dailyTotal)}</p> </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-slate-800">Relatório por Período</h2>
                <form onSubmit={handleGenerateReport} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-6">
                    <div><label htmlFor="reportStartDate" className="block text-sm font-medium text-slate-700 mb-1">Data de Início</label><input type="date" id="reportStartDate" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" required /></div>
                    <div><label htmlFor="reportEndDate" className="block text-sm font-medium text-slate-700 mb-1">Data de Fim</label><input type="date" id="reportEndDate" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" required /></div>
                    <button type="submit" disabled={isLoading} className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-lg hover:bg-slate-900 transition shadow disabled:bg-slate-400">{isLoading ? 'Gerando...' : 'Gerar Relatório'}</button>
                </form>
                <div> {reportData && ( reportData.services.length === 0 ? ( <p className="text-center p-4 text-slate-600">Nenhum serviço encontrado.</p> ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2">
                            <h3 className="text-xl font-semibold mb-3 text-slate-800">Detalhes</h3>
                            <div className="overflow-x-auto rounded-lg border max-h-96"><table className="w-full text-sm text-left text-slate-700"><thead className="bg-slate-100 text-xs uppercase sticky top-0"><tr><th className="p-3">Data</th><th className="p-3">Serviço</th><th className="p-3">Barbeiro</th><th className="p-3 text-right">Valor</th></tr></thead>
                                <tbody>{reportData.services.map(s => (<tr key={s.id} className="border-b hover:bg-slate-50"><td className="p-3">{formatDate(s.createdAt)}</td><td className="p-3">{s.description}</td><td className="p-3">{s.barberName}</td><td className="p-3 text-right font-medium">{formatCurrency(s.value)}</td></tr>))}</tbody>
                            </table></div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-slate-800">Resumo</h3>
                            <div className="space-y-4">
                                <div className="bg-slate-100 p-4 rounded-lg text-center"><p className="text-sm font-medium text-slate-800 uppercase">Receita Total</p><p className="text-3xl font-bold text-slate-900">{formatCurrency(reportData.totalRevenue)}</p></div>
                                <div className="bg-slate-100 p-4 rounded-lg"><h4 className="font-semibold mb-2 text-slate-800">Total por Barbeiro</h4><div className="space-y-1">{Object.entries(reportData.revenueByBarber).map(([name, total]) => ( <div key={name} className="flex justify-between p-2 bg-slate-50 rounded"><span className="font-medium">{name}:</span><span className="font-bold">{formatCurrency(total)}</span></div>))}</div></div>
                            </div>
                        </div>
                    </div>
                ))}</div>
            </div>
        </div>
    );
};

const PixQRCodeModal = ({ isOpen, onClose, onConfirm, orderData }) => {
    const [copySuccess, setCopySuccess] = useState('');

    if (!isOpen || !orderData) return null;

    const { barber, total } = orderData;
    
    const copyToClipboard = () => {
        const pixKey = barber?.pixKey;
        if (pixKey) {
            const textArea = document.createElement("textarea");
            textArea.value = pixKey;
            textArea.style.position = "fixed"; 
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopySuccess('Copiado!');
                setTimeout(() => setCopySuccess(''), 2000);
            } catch (err) {
                setCopySuccess('Falhou!');
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-sm w-full text-center">
                <h2 className="text-2xl font-bold mb-2 text-slate-900">Pagamento via PIX</h2>
                <p className="text-slate-600 mb-4">Cliente deve pagar para <span className="font-semibold">{barber.name}</span></p>

                <div className="bg-slate-100 p-4 rounded-lg mb-4">
                    <p className="text-lg text-slate-700">Valor Total</p>
                    <p className="text-4xl font-bold text-slate-900">{formatCurrency(total)}</p>
                </div>
                
                {barber.pixQRCodeUrl ? (
                    <img src={barber.pixQRCodeUrl} alt="PIX QR Code" className="mx-auto mb-4 border rounded-lg w-48 h-48 object-contain" />
                ) : (
                    <div className="mx-auto mb-4 border rounded-lg w-48 h-48 bg-slate-100 flex items-center justify-center text-center text-sm text-slate-500 p-4">
                        Imagem do QR Code não disponível.
                    </div>
                )}

                {barber.pixKey && (
                    <div className="mb-6">
                        <label className="font-semibold text-slate-800 mb-2 block">PIX Copia e Cola</label>
                        <textarea
                            readOnly
                            className="w-full h-24 p-2 border rounded-lg bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            value={barber.pixKey}
                        />
                        <button onClick={copyToClipboard} className="mt-2 w-full bg-slate-100 text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-200 transition">
                            {copySuccess || 'Copiar Chave'}
                        </button>
                    </div>
                )}
                
                <div className="space-y-3">
                     <button onClick={onConfirm} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition shadow-lg">
                        Confirmar Pagamento e Registrar
                    </button>
                    <button onClick={onClose} className="w-full text-sm text-slate-600 hover:text-slate-800 py-1">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal ---
export default function App() {
    const [activePage, setActivePage] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [barbers, setBarbers] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [dailyServices, setDailyServices] = useState([]);
    const [pixModalData, setPixModalData] = useState(null);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    const barbersCollectionRef = useMemo(() => {
        if (!user) return null;
        return collection(db, `artifacts/${appId}/users/${user.uid}/barbers`);
    }, [user]);

    const serviceTypesCollectionRef = useMemo(() => {
        if (!user) return null;
        return collection(db, `artifacts/${appId}/users/${user.uid}/serviceTypes`);
    }, [user]);
    
    const servicesCollectionRef = useMemo(() => {
        if (!user) return null;
        return collection(db, `artifacts/${appId}/users/${user.uid}/services`);
    }, [user]);

    useEffect(() => {
        const setupAuth = async () => {
            try {
                await setPersistence(auth, browserLocalPersistence);
                const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                    setUser(currentUser);
                    setLoading(false);
                });
                return unsubscribe;
            } catch (e) {
                console.error("Erro ao definir persistência:", e);
                setError("Falha ao configurar a sessão.");
                setLoading(false);
            }
        };

        const unsubscribePromise = setupAuth();

        return () => {
            unsubscribePromise.then(unsubscribe => {
                if (unsubscribe) unsubscribe();
            });
        };
    }, []);

    useEffect(() => { if (!barbersCollectionRef) return; const unsubscribe = onSnapshot(query(barbersCollectionRef), (snapshot) => setBarbers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))); return () => unsubscribe(); }, [barbersCollectionRef]);
    useEffect(() => { if (!serviceTypesCollectionRef) return; const unsubscribe = onSnapshot(query(serviceTypesCollectionRef), (snapshot) => setServiceTypes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))); return () => unsubscribe(); }, [serviceTypesCollectionRef]);
    
    useEffect(() => {
        if (!servicesCollectionRef || barbers.length === 0) return;
        const today = new Date(); today.setHours(0, 0, 0, 0); const startOfToday = Timestamp.fromDate(today);
        const servicesQuery = query(servicesCollectionRef, where('createdAt', '>=', startOfToday));
        const unsubscribe = onSnapshot(servicesQuery, (snapshot) => {
            const barbersMap = barbers.reduce((acc, b) => ({ ...acc, [b.id]: b.name }), {});
            const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), barberName: barbersMap[doc.data().barberId] || 'Desconhecido' })).sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
            setDailyServices(servicesData);
        });
        return () => unsubscribe();
    }, [servicesCollectionRef, barbers]);

    const dailyTotal = useMemo(() => dailyServices.reduce((sum, service) => sum + service.value, 0), [dailyServices]);

    const handleAddBarber = async (barberData) => {
        if (!barbersCollectionRef) return;
        const { name, pixKey, pixQRCodeUrl } = barberData;
        const newBarber = {
            name,
            pixKey,
            pixQRCodeUrl,
            createdAt: Timestamp.now()
        };
        try {
            await addDoc(barbersCollectionRef, newBarber);
        } catch (error) {
            console.error("Erro ao adicionar barbeiro:", error);
        }
    };

    const handleDeleteBarber = async (id) => {
        if(barbersCollectionRef) await deleteDoc(doc(barbersCollectionRef, id));
    };

    const handleAddServiceType = async (serviceData) => {
        if(serviceTypesCollectionRef) await addDoc(serviceTypesCollectionRef, { ...serviceData, createdAt: Timestamp.now() });
    };

    const handleDeleteServiceType = async (id) => { 
        if(serviceTypesCollectionRef) await deleteDoc(doc(serviceTypesCollectionRef, id)); 
    };
    
    const handleRegisterOrder = async () => {
        if (!pixModalData) return;
        const { barber, services, clearDashboard } = pixModalData;
        if (!servicesCollectionRef || !barber?.id || services.length === 0) {
            setPixModalData(null);
            return;
        };

        const timestamp = Timestamp.now();
        const registrationPromises = services.map(service => 
            addDoc(servicesCollectionRef, {
                barberId: barber.id,
                description: service.name,
                value: service.price,
                createdAt: timestamp
            })
        );
        try {
            await Promise.all(registrationPromises);
            if(clearDashboard) clearDashboard();
        } catch (error) { 
            console.error("Erro ao registrar serviço da comanda:", error);
        } finally {
            setPixModalData(null); 
        }
    };

    const handleOpenPixModal = (orderData, clearDashboardCallback) => {
        setPixModalData({ ...orderData, clearDashboard: clearDashboardCallback });
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // O onAuthStateChanged irá atualizar o estado do user para null
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    const renderPage = () => {
        switch (activePage) {
            case 'reports':
                return <ReportsPage barbers={barbers} dailyServices={dailyServices} dailyTotal={dailyTotal} />;
            case 'admin':
                return isAdminAuthenticated ? (
                    <AdminPage 
                        barbers={barbers}
                        onAddBarber={handleAddBarber}
                        onDeleteBarber={handleDeleteBarber}
                        serviceTypes={serviceTypes} 
                        onAddServiceType={handleAddServiceType} 
                        onDeleteServiceType={handleDeleteServiceType}
                        onLogout={() => setIsAdminAuthenticated(false)}
                    />
                ) : (
                    <AdminLoginPage onLoginSuccess={() => setIsAdminAuthenticated(true)} />
                );
            case 'dashboard':
            default:
                return <DashboardPage barbers={barbers} serviceTypes={serviceTypes} onFinalizeOrder={handleOpenPixModal} />;
        }
    };
    
    if (loading) { 
        return <div className="flex items-center justify-center h-screen bg-slate-50"><p className="text-lg text-slate-700">Carregando...</p></div>; 
    }

    if (error) {
        return <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-4">
            <h2 className="text-xl font-bold text-red-600 mb-4">Erro de Ligação</h2>
            <p className="text-slate-700 text-center max-w-md">{error}</p>
        </div>;
    }

    if (!user) {
        return <AuthPage />;
    }

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800">
            <div className="container mx-auto p-4 md:p-8 max-w-7xl">
                <Header />
                <Navigation activePage={activePage} setActivePage={setActivePage} />
                {renderPage()}
                 <PixQRCodeModal 
                    isOpen={!!pixModalData}
                    onClose={() => setPixModalData(null)}
                    onConfirm={handleRegisterOrder}
                    orderData={pixModalData}
                 />
                 <footer className="text-center mt-8 text-sm text-slate-500">
                    <p>App Gerenciador de Barbearia &copy; 2024</p>
                    {user && (
                        <div className="mt-2">
                             <p>ID do Utilizador: <span className="font-mono text-xs">{user.uid}</span></p>
                             <button onClick={handleLogout} className="text-red-500 hover:underline mt-1">Sair</button>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
}

