import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { AppUser } from './models/auth.model';
import {
  PriceComparisonOccurrence,
  PriceComparisonResult,
  ProductSuggestion,
  ShoppingCategory,
  ShoppingItem,
  ShoppingList,
  ShoppingStore
} from './models/shopping-list.model';
import { AdminService } from './services/admin.service';
import { AuthService } from './services/auth.service';
import { CatalogService } from './services/catalog.service';
import { ListsService } from './services/lists.service';
import { PriceCompareService } from './services/price-compare.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly themeKey = 'shoppingListTheme';
  private snackbarTimeout: ReturnType<typeof setTimeout> | null = null;
  title = 'Bevasarlolista';
  lists: ShoppingList[] = [];
  items: ShoppingItem[] = [];
  selectedList: ShoppingList | null = null;
  categories: ShoppingCategory[] = [];
  stores: ShoppingStore[] = [];
  newListName = '';
  listSearchTerm = '';
  newCategoryName = '';
  newStoreName = '';
  newItemName = '';
  newItemQuantity = 1;
  newItemPrice = 0;
  newItemCategoryId = '';
  isLoadingLists = false;
  isLoadingItems = false;
  isReordering = false;
  draggingItemId: string | null = null;
  dragOverItemId: string | null = null;
  currentUser: AppUser | null = null;
  adminUsers: AppUser[] = [];
  authMode: 'login' | 'register' = 'login';
  showAdminPanel = false;
  authName = '';
  authEmail = '';
  authPassword = '';
  authPasswordConfirm = '';
  showAuthPassword = false;
  showAuthPasswordConfirm = false;
  isAuthLoading = false;
  isLoadingAdminUsers = false;
  isDarkMode = localStorage.getItem(this.themeKey) === 'dark';
  snackbarMessage = '';
  errorMessage = '';
  authErrorMessage = '';
  activeView: 'auth' | 'app' = 'auth';
  priceCompareQuery = '';
  priceCompareSuggestions: ProductSuggestion[] = [];
  priceCompareActiveSuggestionIndex = -1;
  priceCompareResult: PriceComparisonResult | null = null;
  isLoadingPriceCompare = false;
  isLoadingPriceSuggestions = false;
  priceCompareErrorMessage = '';

  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
    private readonly catalogService: CatalogService,
    private readonly listsService: ListsService,
    private readonly priceCompareService: PriceCompareService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.activeView = this.resolveInitialView();
    this.replaceHistoryView(this.activeView);

    this.authService.user$.subscribe((user) => {
      this.currentUser = user;

      if (user) {
        this.loadCategories();
        this.loadStores();
        this.loadLists();
      } else {
        this.lists = [];
        this.items = [];
        this.selectedList = null;
        this.categories = [];
        this.stores = [];
        this.adminUsers = [];
        this.showAdminPanel = false;
        this.listSearchTerm = '';
        this.newItemCategoryId = '';
      }
    });
  }

  @HostListener('window:popstate', ['$event'])
  onHistoryChange(event: PopStateEvent): void {
    const historyView = event.state?.shoppingListView;
    this.activeView = historyView === 'app' && this.currentUser ? 'app' : 'auth';
  }

  get completedCount(): number {
    return this.items.filter((item) => item.completed).length;
  }

  get totalPrice(): number {
    return this.items.reduce((total, item) => total + item.quantity * item.price, 0);
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  get passwordsMatch(): boolean {
    return (
      this.authMode === 'register' &&
      this.authPassword !== '' &&
      this.authPasswordConfirm !== '' &&
      this.authPassword === this.authPasswordConfirm
    );
  }

  get passwordsDoNotMatch(): boolean {
    return (
      this.authMode === 'register' &&
      this.authPasswordConfirm.length > 0 &&
      this.authPassword !== this.authPasswordConfirm
    );
  }

  get filteredLists(): ShoppingList[] {
    const searchTerm = this.listSearchTerm.trim().toLowerCase();

    if (!searchTerm) {
      return this.lists;
    }

    return this.lists.filter((list) =>
      list.name.toLowerCase().includes(searchTerm)
    );
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem(this.themeKey, this.isDarkMode ? 'dark' : 'light');
  }

  trackByItemId(_index: number, item: ShoppingItem): string {
    return item._id;
  }

  trackByPriceOccurrenceId(
    _index: number,
    occurrence: PriceComparisonOccurrence
  ): string {
    return occurrence._id;
  }

  categoryName(categoryId?: string | null): string {
    return this.categories.find((category) => category._id === categoryId)?.name || '';
  }

  storeName(storeId?: string | null): string {
    return this.stores.find((store) => store._id === storeId)?.name || '';
  }

  submitAuth(): void {
    this.authMode === 'login' ? this.login() : this.register();
  }

  login(): void {
    this.isAuthLoading = true;
    this.authErrorMessage = '';

    this.authService
      .login({
        email: this.authEmail,
        password: this.authPassword
      })
      .pipe(finalize(() => (this.isAuthLoading = false)))
      .subscribe({
        next: () => {
          this.resetAuthForm();
          this.showAppView();
        },
        error: (error: HttpErrorResponse) => {
          this.authErrorMessage =
            error.error?.error || 'Sikertelen bejelentkezes.';
        }
      });
  }

  register(): void {
    this.authErrorMessage = '';

    if (this.authPassword !== this.authPasswordConfirm) {
      this.authErrorMessage = 'A ket jelszo nem egyezik.';
      return;
    }

    this.isAuthLoading = true;

    this.authService
      .register({
        name: this.authName,
        email: this.authEmail,
        password: this.authPassword
      })
      .pipe(finalize(() => (this.isAuthLoading = false)))
      .subscribe({
        next: () => {
          this.resetAuthForm();
          this.showAppView();
        },
        error: (error: HttpErrorResponse) => {
          this.authErrorMessage =
            error.error?.error || 'Sikertelen regisztracio. Ellenorizd az adatokat.';
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.showAuthView();
  }

  switchAuthMode(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.authErrorMessage = '';
    this.authPassword = '';
    this.authPasswordConfirm = '';
    this.showAuthPassword = false;
    this.showAuthPasswordConfirm = false;
  }

  continueToApp(): void {
    if (!this.currentUser) {
      return;
    }

    this.showAppView();
  }

  onPriceCompareTermChange(query: string): void {
    this.priceCompareQuery = query;
    this.priceCompareResult = null;
    this.priceCompareErrorMessage = '';

    const searchTerm = query.trim();

    if (!searchTerm) {
      this.priceCompareSuggestions = [];
      this.priceCompareActiveSuggestionIndex = -1;
      return;
    }

    this.priceCompareActiveSuggestionIndex = -1;
    this.isLoadingPriceSuggestions = true;

    this.priceCompareService
      .getSuggestions(searchTerm)
      .pipe(finalize(() => (this.isLoadingPriceSuggestions = false)))
      .subscribe({
        next: (suggestions) => {
          if (this.priceCompareQuery.trim() !== searchTerm) {
            return;
          }

          this.priceCompareSuggestions = suggestions;
          this.priceCompareActiveSuggestionIndex = suggestions.length > 0 ? 0 : -1;
        },
        error: () => {
          this.priceCompareSuggestions = [];
          this.priceCompareActiveSuggestionIndex = -1;
        }
      });
  }

  onPriceCompareKeydown(event: KeyboardEvent): void {
    if (this.priceCompareSuggestions.length === 0) {
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      this.applyPriceSuggestion(this.priceCompareSuggestions[0], false);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.priceCompareActiveSuggestionIndex =
        (this.priceCompareActiveSuggestionIndex + 1) %
        this.priceCompareSuggestions.length;
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.priceCompareActiveSuggestionIndex =
        this.priceCompareActiveSuggestionIndex <= 0
          ? this.priceCompareSuggestions.length - 1
          : this.priceCompareActiveSuggestionIndex - 1;
      return;
    }

    if (event.key === 'Enter' && this.priceCompareActiveSuggestionIndex >= 0) {
      event.preventDefault();
      this.applyPriceSuggestion(
        this.priceCompareSuggestions[this.priceCompareActiveSuggestionIndex],
        true
      );
    }
  }

  selectPriceSuggestion(suggestion: ProductSuggestion): void {
    this.applyPriceSuggestion(suggestion, true);
  }

  private applyPriceSuggestion(
    suggestion: ProductSuggestion,
    shouldCompare: boolean
  ): void {
    this.priceCompareQuery = suggestion.name;
    this.priceCompareSuggestions = [];
    this.priceCompareActiveSuggestionIndex = -1;

    if (shouldCompare) {
      this.compareGuestProduct();
    }
  }

  compareGuestProduct(): void {
    const searchTerm = this.priceCompareQuery.trim();

    if (!searchTerm) {
      this.priceCompareErrorMessage = 'Adj meg egy termeknevet a kereseshez.';
      this.priceCompareResult = null;
      return;
    }

    this.isLoadingPriceCompare = true;
    this.priceCompareErrorMessage = '';

    this.priceCompareService
      .compareProduct(searchTerm)
      .pipe(finalize(() => (this.isLoadingPriceCompare = false)))
      .subscribe({
        next: (result) => {
          this.priceCompareResult = result;
          if (result.totalOccurrences === 0) {
            this.priceCompareErrorMessage = 'Nincs talalat erre a termekre.';
          }
        },
        error: (error: HttpErrorResponse) => {
          this.priceCompareResult = null;
          this.priceCompareErrorMessage =
            error.error?.error || 'Nem sikerult betolteni az arakat.';
        }
      });
  }

  toggleAdminPanel(): void {
    this.showAdminPanel = !this.showAdminPanel;

    if (this.showAdminPanel) {
      this.loadAdminUsers();
    }
  }

  loadAdminUsers(): void {
    if (!this.isAdmin) {
      return;
    }

    this.isLoadingAdminUsers = true;
    this.errorMessage = '';

    this.adminService
      .getUsers()
      .pipe(finalize(() => (this.isLoadingAdminUsers = false)))
      .subscribe({
        next: (users) => {
          this.adminUsers = users;
        },
        error: () => {
          this.errorMessage = 'Nem sikerult betolteni a felhasznalokat.';
        }
      });
  }

  deleteUser(user: AppUser): void {
    if (!this.isAdmin || user._id === this.currentUser?._id) {
      return;
    }

    const shouldDelete = window.confirm(
      `Biztosan torlod ezt a felhasznalot: ${user.name} (${user.email})?`
    );

    if (!shouldDelete) {
      return;
    }

    this.errorMessage = '';

    this.adminService.deleteUser(user._id).subscribe({
      next: () => {
        this.adminUsers = this.adminUsers.filter(
          (currentUser) => currentUser._id !== user._id
        );
        this.showSnackbar('Felhasznalo sikeresen torolve.');
      },
      error: () => {
        this.errorMessage = 'Nem sikerult torolni a felhasznalot.';
      }
    });
  }

  private showSnackbar(message: string): void {
    this.snackbarMessage = message;

    if (this.snackbarTimeout) {
      clearTimeout(this.snackbarTimeout);
    }

    this.snackbarTimeout = setTimeout(() => {
      this.snackbarMessage = '';
      this.snackbarTimeout = null;
    }, 2000);
  }

  private resetAuthForm(): void {
    this.authName = '';
    this.authEmail = '';
    this.authPassword = '';
    this.authPasswordConfirm = '';
    this.showAuthPassword = false;
    this.showAuthPasswordConfirm = false;
  }

  private resolveInitialView(): 'auth' | 'app' {
    const historyView = window.history.state?.shoppingListView;

    if (this.currentUser && historyView !== 'auth') {
      return 'app';
    }

    return 'auth';
  }

  private showAppView(): void {
    this.activeView = 'app';
    this.pushHistoryView('app');
  }

  private showAuthView(): void {
    this.activeView = 'auth';
    this.pushHistoryView('auth');
  }

  private pushHistoryView(view: 'auth' | 'app'): void {
    if (window.history.state?.shoppingListView === view) {
      this.replaceHistoryView(view);
      return;
    }

    window.history.pushState({ shoppingListView: view }, '', window.location.href);
  }

  private replaceHistoryView(view: 'auth' | 'app'): void {
    window.history.replaceState({ shoppingListView: view }, '', window.location.href);
  }

  loadCategories(): void {
    this.catalogService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.errorMessage = 'Nem sikerult betolteni a kategoriakat.';
      }
    });
  }

  createCategory(): void {
    const name = this.newCategoryName.trim();

    if (!name) {
      return;
    }

    this.catalogService.createCategory(name).subscribe({
      next: (category) => {
        this.categories = [...this.categories, category].sort((first, second) =>
          first.name.localeCompare(second.name)
        );
        this.newCategoryName = '';
      },
      error: () => {
        this.errorMessage = 'Nem sikerult letrehozni a kategoriat.';
      }
    });
  }

  loadStores(): void {
    this.catalogService.getStores().subscribe({
      next: (stores) => {
        this.stores = stores;
      },
      error: () => {
        this.errorMessage = 'Nem sikerult betolteni a boltokat.';
      }
    });
  }

  createStore(): void {
    const name = this.newStoreName.trim();

    if (!name) {
      return;
    }

    this.catalogService.createStore(name).subscribe({
      next: (store) => {
        this.stores = [...this.stores, store].sort((first, second) =>
          first.name.localeCompare(second.name)
        );
        this.newStoreName = '';
      },
      error: () => {
        this.errorMessage = 'Nem sikerult letrehozni a boltot.';
      }
    });
  }

  loadLists(): void {
    this.isLoadingLists = true;
    this.errorMessage = '';

    this.listsService
      .getLists()
      .pipe(finalize(() => (this.isLoadingLists = false)))
      .subscribe({
        next: (lists) => {
          this.lists = lists;

          if (!this.selectedList && lists.length > 0) {
            this.selectList(lists[0]);
            return;
          }

          if (this.selectedList) {
            const refreshedList = lists.find((list) => list._id === this.selectedList?._id);
            this.selectedList = refreshedList ?? null;
          }
        },
        error: () => {
          this.errorMessage = 'Nem sikerult betolteni a listakat.';
        }
      });
  }

  selectList(list: ShoppingList): void {
    this.selectedList = list;
    this.loadItems(list._id);
  }

  updateSelectedListStore(storeId: string): void {
    if (!this.selectedList) {
      return;
    }

    this.errorMessage = '';

    this.listsService
      .updateList(this.selectedList._id, {
        name: this.selectedList.name,
        storeId: storeId || null
      })
      .subscribe({
        next: (updatedList) => {
          this.selectedList = updatedList;
          this.lists = this.lists.map((list) =>
            list._id === updatedList._id ? updatedList : list
          );
          this.showSnackbar('A lista boltja frissitve.');
        },
        error: () => {
          this.errorMessage = 'Nem sikerult frissiteni a lista boltjat.';
        }
      });
  }

  createList(): void {
    const name = this.newListName.trim();

    if (!name) {
      return;
    }

    this.errorMessage = '';

    this.listsService
      .createList({
        name
      })
      .subscribe({
      next: (list) => {
        this.lists = [...this.lists, list];
        this.newListName = '';
        this.selectList(list);
      },
      error: () => {
        this.errorMessage = 'Nem sikerult letrehozni a listat.';
      }
    });
  }

  deleteSelectedList(): void {
    if (!this.selectedList) {
      return;
    }

    const shouldDelete = window.confirm(
      `Biztosan torlod ezt a listat: ${this.selectedList.name}?`
    );

    if (!shouldDelete) {
      return;
    }

    const listId = this.selectedList._id;
    this.errorMessage = '';

    this.listsService.deleteList(listId).subscribe({
      next: () => {
        this.lists = this.lists.filter((list) => list._id !== listId);
        this.selectedList = this.lists[0] ?? null;
        this.items = [];

        if (this.selectedList) {
          this.loadItems(this.selectedList._id);
        }
      },
      error: () => {
        this.errorMessage = 'Nem sikerult torolni a listat.';
      }
    });
  }

  loadItems(listId: string): void {
    this.isLoadingItems = true;
    this.errorMessage = '';

    this.listsService
      .getItems(listId)
      .pipe(finalize(() => (this.isLoadingItems = false)))
      .subscribe({
        next: (items) => {
          this.items = items;
        },
        error: () => {
          this.errorMessage = 'Nem sikerult betolteni a lista elemeit.';
        }
      });
  }

  createItem(): void {
    if (!this.selectedList) {
      return;
    }

    const name = this.newItemName.trim();

    if (!name || this.newItemQuantity < 1 || this.newItemPrice < 0) {
      return;
    }

    this.errorMessage = '';

    this.listsService
      .createItem(this.selectedList._id, {
        name,
        quantity: this.newItemQuantity,
        price: this.newItemPrice,
        categoryId: this.newItemCategoryId || null
      })
      .subscribe({
        next: (item) => {
          this.items = [...this.items, item];
          this.newItemName = '';
          this.newItemQuantity = 1;
          this.newItemPrice = 0;
          this.newItemCategoryId = '';
        },
        error: () => {
          this.errorMessage = 'Nem sikerult hozzaadni az elemet.';
        }
      });
  }

  toggleItem(item: ShoppingItem): void {
    if (!this.selectedList) {
      return;
    }

    this.errorMessage = '';

    this.listsService
      .updateItem(this.selectedList._id, item._id, {
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        completed: !item.completed,
        categoryId: item.categoryId || null
      })
      .subscribe({
        next: (updatedItem) => {
          this.items = this.items.map((currentItem) =>
            currentItem._id === updatedItem._id ? updatedItem : currentItem
          );
        },
        error: () => {
          this.errorMessage = 'Nem sikerult frissiteni az elemet.';
        }
      });
  }

  deleteItem(item: ShoppingItem): void {
    if (!this.selectedList) {
      return;
    }

    this.errorMessage = '';

    this.listsService.deleteItem(this.selectedList._id, item._id).subscribe({
      next: () => {
        this.items = this.items.filter((currentItem) => currentItem._id !== item._id);
      },
      error: () => {
        this.errorMessage = 'Nem sikerult torolni az elemet.';
      }
    });
  }

  startItemDrag(event: DragEvent, item: ShoppingItem): void {
    if (this.isReordering) {
      event.preventDefault();
      return;
    }

    this.draggingItemId = item._id;
    event.dataTransfer?.setData('text/plain', item._id);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  moveItemOver(event: DragEvent, item: ShoppingItem): void {
    if (!this.draggingItemId || this.draggingItemId === item._id) {
      return;
    }

    event.preventDefault();
    this.dragOverItemId = item._id;

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  leaveItem(item: ShoppingItem): void {
    if (this.dragOverItemId === item._id) {
      this.dragOverItemId = null;
    }
  }

  finishItemDrag(): void {
    this.draggingItemId = null;
    this.dragOverItemId = null;
  }

  dropItem(event: DragEvent, targetItem: ShoppingItem): void {
    event.preventDefault();

    if (!this.selectedList) {
      this.finishItemDrag();
      return;
    }

    const draggedItemId =
      event.dataTransfer?.getData('text/plain') || this.draggingItemId;

    if (!draggedItemId || draggedItemId === targetItem._id) {
      this.finishItemDrag();
      return;
    }

    const fromIndex = this.items.findIndex((item) => item._id === draggedItemId);
    const toIndex = this.items.findIndex((item) => item._id === targetItem._id);

    if (fromIndex < 0 || toIndex < 0) {
      this.finishItemDrag();
      return;
    }

    const previousItems = [...this.items];
    const reorderedItems = [...this.items];
    const [movedItem] = reorderedItems.splice(fromIndex, 1);
    reorderedItems.splice(toIndex, 0, movedItem);

    this.items = reorderedItems.map((item, index) => ({ ...item, order: index }));
    this.isReordering = true;
    this.errorMessage = '';

    this.listsService
      .reorderItems(
        this.selectedList._id,
        this.items.map((item) => item._id)
      )
      .pipe(
        finalize(() => {
          this.isReordering = false;
          this.finishItemDrag();
        })
      )
      .subscribe({
        next: (updatedItems) => {
          this.items = updatedItems.sort((first, second) => first.order - second.order);
        },
        error: () => {
          this.items = previousItems;
          this.errorMessage = 'Nem sikerult menteni az uj sorrendet.';
        }
      });
  }
}
