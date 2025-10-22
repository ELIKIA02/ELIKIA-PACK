import React, { useState, useMemo, useEffect, useRef } from 'react';
import FullscreenButton from '../components/FullscreenButton';
import type { ToolPageProps, Expense, ExpenseCategory, ExpenseType, GroceryItem, BudgetDatabase } from '../types';

// Declare jspdf on the window object since it's loaded from a CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

const CATEGORIES: ExpenseCategory[] = ['Logement', 'Transport', 'Alimentation', 'Abonnements', 'Loisirs', 'Autre'];
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Logement: 'bg-red-500',
  Transport: 'bg-blue-500',
  Alimentation: 'bg-green-500',
  Abonnements: 'bg-purple-500',
  Loisirs: 'bg-yellow-500',
  Autre: 'bg-gray-400',
};

const BudgetPage: React.FC<ToolPageProps> = ({ isFullscreen, setIsFullscreen }) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'groceries'>('expenses');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- Start Expenses Logic ---
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Alimentation');
  const [type, setType] = useState<ExpenseType>('Variable');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem('budget-expenses');
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    } catch (e) { console.error("Failed to load expenses", e); }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('budget-expenses', JSON.stringify(expenses));
    } catch (e) { console.error("Failed to save expenses", e); }
  }, [expenses]);

  const { grandTotal, fixedTotal, variableTotal, fixedExpenses, variableExpenses } = useMemo(() => {
    const fixedExpenses = expenses.filter(e => e.type === 'Fixe');
    const variableExpenses = expenses.filter(e => e.type === 'Variable');
    const fixedTotal = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const variableTotal = variableExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return { grandTotal: fixedTotal + variableTotal, fixedTotal, variableTotal, fixedExpenses, variableExpenses };
  }, [expenses]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount, 10);
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Veuillez entrer un nom valide et un montant positif.');
      return;
    }
    const newExpense: Expense = { id: new Date().toISOString(), name, amount: parsedAmount, category, type };
    setExpenses(prev => [...prev, newExpense].sort((a, b) => b.amount - a.amount));
    setName('');
    setAmount('');
    setError('');
  };

  const deleteExpense = (id: string) => setExpenses(prev => prev.filter(expense => expense.id !== id));
  // --- End Expenses Logic ---


  // --- Start Groceries Logic ---
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [groceryError, setGroceryError] = useState('');

  useEffect(() => {
    try {
      const savedGroceries = localStorage.getItem('budget-groceries');
      if (savedGroceries) setGroceryList(JSON.parse(savedGroceries));
    } catch (e) { console.error("Failed to load groceries", e); }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('budget-groceries', JSON.stringify(groceryList));
    } catch (e) { console.error("Failed to save groceries", e); }
  }, [groceryList]);

  const { budgetTotal, purchasedTotal, remainingTotal } = useMemo(() => {
    const budgetTotal = groceryList.reduce((sum, item) => sum + item.price, 0);
    const purchasedTotal = groceryList.filter(item => item.purchased).reduce((sum, item) => sum + item.price, 0);
    return { budgetTotal, purchasedTotal, remainingTotal: budgetTotal - purchasedTotal };
  }, [groceryList]);

  const handleAddGroceryItem = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseInt(itemPrice, 10);
    if (!itemName.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      setGroceryError('Veuillez entrer un nom valide et un prix positif.');
      return;
    }
    const newItem: GroceryItem = { id: new Date().toISOString(), name: itemName, price: parsedPrice, purchased: false };
    setGroceryList(prev => [...prev, newItem]);
    setItemName('');
    setItemPrice('');
    setGroceryError('');
  };

  const toggleGroceryItem = (id: string) => {
    setGroceryList(prev => prev.map(item => item.id === id ? { ...item, purchased: !item.purchased } : item));
  };
  
  const deleteGroceryItem = (id: string) => setGroceryList(prev => prev.filter(item => item.id !== id));
  
  const handleDownloadPDF = () => {
    if (groceryList.length === 0 || typeof window.jspdf === 'undefined') return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    // --- Header ---
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("Liste de Courses", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(today, pageWidth / 2, 26, { align: 'center' });

    // --- AutoTable ---
    (doc as any).autoTable({
      startY: 35,
      head: [['', 'Article', 'Prix']],
      body: groceryList.map(item => ({...item})),
      columns: [
        { header: '', dataKey: 'checkbox' },
        { header: 'Article', dataKey: 'name' },
        { header: 'Prix', dataKey: 'price' },
      ],
      theme: 'striped',
      headStyles: { 
        fillColor: [22, 160, 133], 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center'
      },
      foot: [['', 'Total Prévu', formatCurrency(budgetTotal, true)]],
      footStyles: { 
        fillColor: [244, 246, 249], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold',
        fontSize: 12,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { fontStyle: 'bold' },
        2: { halign: 'right' },
      },
      didParseCell: (data: any) => {
        if (data.column.dataKey === 'price' && data.section === 'body') {
            data.cell.text = [formatCurrency(data.cell.raw as number, true)];
        }
      },
      didDrawCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 0) {
            const squareSize = 4;
            const x = data.cell.x + (data.cell.width - squareSize) / 2;
            const y = data.cell.y + (data.cell.height - squareSize) / 2;
            doc.setDrawColor(180);
            doc.setLineWidth(0.2);
            doc.rect(x, y, squareSize, squareSize, 'S');
        }
      },
      didDrawPage: (data: any) => {
        // --- Footer ---
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        
        doc.text(`Page ${data.pageNumber} sur ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text("Généré par ELIKIA Tools", pageWidth - 14, pageHeight - 10, { align: 'right' });
      },
      margin: { top: 35 }
    });

    doc.save('liste-de-courses.pdf');
  };

  const handleDownloadICS = () => {
      if (groceryList.length === 0) return;

      const EOL = "\r\n";
      let icsString = "BEGIN:VCALENDAR" + EOL +
                      "VERSION:2.0" + EOL +
                      "PRODID:-//ElikiaTools//NONSGML v1.0//EN" + EOL;

      groceryList.forEach(item => {
          icsString += "BEGIN:VTODO" + EOL;
          icsString += `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '')}Z` + EOL;
          icsString += `UID:${item.id}@elikiatools.com` + EOL;
          icsString += `SUMMARY:${item.name} (${formatCurrency(item.price)})` + EOL;
          icsString += "END:VTODO" + EOL;
      });

      icsString += "END:VCALENDAR";

      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'liste-de-courses.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  // --- End Groceries Logic ---

  // --- Start Import/Export/PDF Summary Logic ---
  const handleSaveData = () => {
    const budgetData: BudgetDatabase = {
      expenses,
      groceryList,
    };
    const dataStr = JSON.stringify(budgetData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.download = `budget-elikia-tools-${today}.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') return;

      try {
        const data: BudgetDatabase = JSON.parse(text);
        if (Array.isArray(data.expenses) && Array.isArray(data.groceryList)) {
          if (window.confirm("Êtes-vous sûr de vouloir remplacer les données actuelles par celles du fichier ? Cette action est irréversible.")) {
            setExpenses(data.expenses);
            setGroceryList(data.groceryList);
          }
        } else {
          alert("Le fichier de sauvegarde est invalide ou corrompu.");
        }
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        alert("Impossible de lire le fichier. Assurez-vous qu'il s'agit d'un fichier de sauvegarde valide.");
      }
    };
    reader.readAsText(file);
    if(event.target) event.target.value = ''; // Reset file input
  };

  const triggerFileLoad = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadBudgetPDF = () => {
    if ((expenses.length === 0 && budgetTotal === 0) || typeof window.jspdf === 'undefined') return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    let finalY = 0;

    // --- Header ---
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("Résumé du Budget Mensuel", pageWidth / 2, 20, { align: 'center' });
    
    const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(today, pageWidth / 2, 26, { align: 'center' });

    // --- Data for PDF ---
    const variableExpensesForPDF = [...variableExpenses];
    if (budgetTotal > 0) {
      variableExpensesForPDF.push({
        id: 'grocery-summary-pdf',
        name: 'Total Liste de Courses',
        amount: budgetTotal,
        category: 'Alimentation',
        type: 'Variable'
      });
    }
    const variableTotalForPDF = variableTotal + budgetTotal;
    const grandTotalForPDF = fixedTotal + variableTotalForPDF;

    // --- Summary Table ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50);
    doc.text("Vue d'ensemble", 14, 40);

    (doc as any).autoTable({
        startY: 45,
        body: [
            ['Charges Fixes', formatCurrency(fixedTotal, true)],
            ['Dépenses Variables (incl. Courses)', formatCurrency(variableTotalForPDF, true)],
            ['Grand Total', formatCurrency(grandTotalForPDF, true)],
        ],
        theme: 'grid',
        styles: { fontSize: 11 },
        headStyles: { fontStyle: 'bold' },
        bodyStyles: { fontStyle: 'bold' },
        columnStyles: { 0: { fontStyle: 'normal' }, 1: { halign: 'right' } },
    });
    
    finalY = (doc as any).lastAutoTable.finalY;

    // --- Fixed Expenses Table ---
    if (fixedExpenses.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50);
        doc.text("Détail des Charges Fixes", 14, finalY + 15);

        (doc as any).autoTable({
            startY: finalY + 20,
            head: [['Nom', 'Catégorie', 'Montant']],
            body: fixedExpenses.map(e => [e.name, e.category, formatCurrency(e.amount, true)]),
            theme: 'striped',
            headStyles: { fillColor: [220, 53, 69], fontStyle: 'bold' },
            foot: [['Total Fixe', '', formatCurrency(fixedTotal, true)]],
            footStyles: { fontStyle: 'bold' },
            columnStyles: { 2: { halign: 'right' } },
        });
        finalY = (doc as any).lastAutoTable.finalY;
    }

    // --- Variable Expenses Table ---
    if (variableExpensesForPDF.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50);
        doc.text("Détail des Dépenses Variables", 14, finalY + 15);

        (doc as any).autoTable({
            startY: finalY + 20,
            head: [['Nom', 'Catégorie', 'Montant']],
            body: variableExpensesForPDF.map(e => [e.name, e.category, formatCurrency(e.amount, true)]),
            theme: 'striped',
            headStyles: { fillColor: [255, 193, 7], fontStyle: 'bold', textColor: 255 },
            foot: [['Total Variable', '', formatCurrency(variableTotalForPDF, true)]],
            footStyles: { fontStyle: 'bold' },
            columnStyles: { 2: { halign: 'right' } },
        });
    }

    // --- Add footer to all pages ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} sur ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text("Généré par ELIKIA Tools", pageWidth - 14, pageHeight - 10, { align: 'right' });
    }

    const todayFilename = new Date().toISOString().split('T')[0];
    doc.save(`resume-budget-${todayFilename}.pdf`);
  };
  // --- End Import/Export/PDF Summary Logic ---

  const formatCurrency = (value: number, useDot: boolean = false) => {
    const separator = useDot ? '.' : ' ';
    // Use non-breaking space for UI display to prevent line breaks
    const uiSeparator = useDot ? '.' : '\u00A0';
    const formatted = value.toLocaleString('fr-FR').replace(/\s/g, separator);
    if (useDot) {
      return `${formatted} FCFA`;
    }
    return `${value.toLocaleString('fr-FR').replace(/\s/g, uiSeparator)} FCFA`;
  };

  const TabButton: React.FC<{tabId: string, activeTab: string, setActiveTab: (id: string) => void, children: React.ReactNode}> = ({ tabId, activeTab, setActiveTab, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabId ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <FullscreenButton isFullscreen={isFullscreen} onClick={() => setIsFullscreen(!isFullscreen)} />
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />
      <div className="max-w-6xl w-full mx-auto h-full flex flex-col">
        <header className="mb-6 text-center relative">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight sm:text-5xl">Gestionnaire de Budget</h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Suivez vos dépenses, planifiez vos courses et contrôlez vos charges.
          </p>
          <div className="absolute top-0 right-0 flex gap-3">
             <button onClick={handleSaveData} className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-blue-600 transition-all" title="Enregistrer les données">
                <i className="fa-solid fa-save"></i>
             </button>
             <button onClick={triggerFileLoad} className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-green-600 transition-all" title="Ouvrir un fichier de données">
                <i className="fa-solid fa-folder-open"></i>
             </button>
             <button onClick={handleDownloadBudgetPDF} disabled={expenses.length === 0 && groceryList.length === 0} className="w-10 h-10 bg-slate-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed" title="Télécharger le résumé du budget en PDF">
                <i className="fa-solid fa-file-pdf"></i>
             </button>
          </div>
        </header>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-4">
            <TabButton tabId="expenses" activeTab={activeTab} setActiveTab={setActiveTab}>Dépenses</TabButton>
            <TabButton tabId="groceries" activeTab={activeTab} setActiveTab={setActiveTab}>Courses du Mois</TabButton>
          </nav>
        </div>

        {activeTab === 'expenses' && (
          <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 flex flex-col h-fit">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajouter une Dépense</h2>
              <form onSubmit={handleAddExpense} className="flex flex-col space-y-4">
                 {/* Expense form fields... */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
                  <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Loyer, Netflix..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Montant (FCFA)</label>
                  <input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Ex: 50000" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select id="category" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <div className="mt-2 flex space-x-4">
                      <div className="flex items-center">
                          <input id="type-fixe" name="expense-type" type="radio" value="Fixe" checked={type === 'Fixe'} onChange={() => setType('Fixe')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                          <label htmlFor="type-fixe" className="ml-3 block text-sm font-medium text-gray-700">Fixe</label>
                      </div>
                      <div className="flex items-center">
                          <input id="type-variable" name="expense-type" type="radio" value="Variable" checked={type === 'Variable'} onChange={() => setType('Variable')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                          <label htmlFor="type-variable" className="ml-3 block text-sm font-medium text-gray-700">Variable</label>
                      </div>
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md">Ajouter</button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Résumé des Charges</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-red-50 rounded-lg"><p className="text-sm text-red-700 font-medium">Charges Fixes</p><p className="text-2xl font-bold text-red-900 tracking-tight">{formatCurrency(fixedTotal)}</p></div>
                  <div className="p-4 bg-yellow-50 rounded-lg"><p className="text-sm text-yellow-700 font-medium">Dépenses Variables</p><p className="text-2xl font-bold text-yellow-900 tracking-tight">{formatCurrency(variableTotal)}</p></div>
                  <div className="p-4 bg-slate-100 rounded-lg"><p className="text-sm text-slate-700 font-medium">Grand Total</p><p className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(grandTotal)}</p></div>
              </div>
              <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                <div><h3 className="text-lg font-semibold text-gray-700 mb-2 mt-4">Charges Fixes</h3><ul className="space-y-2">{fixedExpenses.length > 0 ? fixedExpenses.map(expense => (<li key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"><div><p className="font-semibold text-gray-800">{expense.name}</p><span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${CATEGORY_COLORS[expense.category]}`}>{expense.category}</span></div><div className="flex items-center gap-4"><p className="font-mono text-gray-900">{formatCurrency(expense.amount)}</p><button onClick={() => deleteExpense(expense.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Supprimer"><i className="fa-solid fa-trash-can"></i></button></div></li>)) : (<p className="text-center text-gray-500 py-4">Aucune dépense de ce type.</p>)}</ul></div>
                <div><h3 className="text-lg font-semibold text-gray-700 mb-2 mt-4">Dépenses Variables</h3><ul className="space-y-2">{variableExpenses.length > 0 ? variableExpenses.map(expense => (<li key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"><div><p className="font-semibold text-gray-800">{expense.name}</p><span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${CATEGORY_COLORS[expense.category]}`}>{expense.category}</span></div><div className="flex items-center gap-4"><p className="font-mono text-gray-900">{formatCurrency(expense.amount)}</p><button onClick={() => deleteExpense(expense.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Supprimer"><i className="fa-solid fa-trash-can"></i></button></div></li>)) : (<p className="text-center text-gray-500 py-4">Aucune dépense de ce type.</p>)}</ul></div>
              </div>
            </div>
          </main>
        )}

        {activeTab === 'groceries' && (
          <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 flex flex-col h-fit">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajouter un Article</h2>
              <form onSubmit={handleAddGroceryItem} className="flex flex-col space-y-4 mb-6">
                <div>
                  <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Nom de l'article</label>
                  <input id="itemName" type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ex: Sac de riz, Huile..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700">Prix (FCFA)</label>
                  <input id="itemPrice" type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="Ex: 1500" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                {groceryError && <p className="text-red-500 text-sm">{groceryError}</p>}
                <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors shadow-md">Ajouter à la liste</button>
              </form>
              <div className="space-y-4 border-t pt-6">
                <div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm text-blue-700 font-medium">Budget Prévu</p><p className="text-2xl font-bold text-blue-900 tracking-tight">{formatCurrency(budgetTotal)}</p></div>
                <div className="p-4 bg-green-50 rounded-lg"><p className="text-sm text-green-700 font-medium">Déjà Acheté</p><p className="text-2xl font-bold text-green-900 tracking-tight">{formatCurrency(purchasedTotal)}</p></div>
                <div className="p-4 bg-yellow-50 rounded-lg"><p className="text-sm text-yellow-700 font-medium">Restant à Payer</p><p className="text-2xl font-bold text-yellow-900 tracking-tight">{formatCurrency(remainingTotal)}</p></div>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Liste de Courses</h2>
                <div className="flex items-center gap-3">
                    <button onClick={handleDownloadPDF} disabled={groceryList.length === 0} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Télécharger en PDF/Feuille">
                        <i className="fa-solid fa-file-pdf text-red-600"></i>
                        <span>PDF / Feuille</span>
                    </button>
                    <button onClick={handleDownloadICS} disabled={groceryList.length === 0} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Ajouter à Rappels (iPhone)">
                        <i className="fa-brands fa-apple text-black"></i>
                        <span>Rappels iPhone</span>
                    </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                <ul className="space-y-2">
                  {groceryList.length > 0 ? groceryList.map(item => (
                    <li key={item.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${item.purchased ? 'bg-green-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <div className="flex items-center">
                        <input type="checkbox" checked={item.purchased} onChange={() => toggleGroceryItem(item.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor={`item-${item.id}`} className={`ml-3 font-semibold ${item.purchased ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{item.name}</label>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`font-mono ${item.purchased ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{formatCurrency(item.price)}</p>
                        <button onClick={() => deleteGroceryItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Supprimer"><i className="fa-solid fa-trash-can"></i></button>
                      </div>
                    </li>
                  )) : (
                    <p className="text-center text-gray-500 py-10">Votre liste de courses est vide.</p>
                  )}
                </ul>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default BudgetPage;
