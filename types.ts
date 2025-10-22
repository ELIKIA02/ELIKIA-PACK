import React from 'react';

export type CharacterMap = Record<string, string>;

export interface TextStyle {
  id: string;
  name: string;
  label: React.ReactNode;
  transform: (text: string) => string;
  className: string;
}

export interface ToolPageProps {
  isFullscreen: boolean;
  setIsFullscreen: (isFull: boolean) => void;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  component: React.FC<ToolPageProps>;
}

// Types for Budget Manager
export type ExpenseCategory = 'Logement' | 'Transport' | 'Alimentation' | 'Abonnements' | 'Loisirs' | 'Autre';
export type ExpenseType = 'Fixe' | 'Variable';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
}

export interface GroceryItem {
  id: string;
  name: string;
  price: number;
  purchased: boolean;
}

export interface BudgetDatabase {
  expenses: Expense[];
  groceryList: GroceryItem[];
}
