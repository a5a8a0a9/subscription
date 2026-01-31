import { Injectable } from '@angular/core';
import { ThemeMode } from './theme.model';

@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	constructor() {}

	/**
	 * @description 主題初始化
	 * @return {*}
	 * @memberof ThemeService
	 */
	init(): void {
		const currentTheme = this.getTheme();
		if (!!currentTheme) {
			return this.setTheme(currentTheme);
		}

		const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
		const isDarkMode: boolean = prefersDarkTheme.matches;

		const theme: ThemeMode = isDarkMode ? 'dark' : 'light';
		this.setTheme(theme);
	}

	/**
	 * @description 切換主題
	 * @memberof ThemeService
	 */
	toggle(): void {
		const themeMode = this.getTheme();

		this.setTheme(themeMode === 'dark' ? 'light' : 'dark');
	}

	/**
	 * @description 設定主題
	 * @param {ThemeMode} theme 主題模式
	 * @return {*}
	 * @memberof ThemeService
	 */
	setTheme(theme: ThemeMode): void {
		localStorage.setItem('ui-theme', theme);

		const element: HTMLHtmlElement | null = document.querySelector('html');

		if (theme === 'light') {
			element?.classList.remove('yo-dark');
		} else {
			element?.classList.add('yo-dark');
		}
	}

	/**
	 * @description 取得當前主題
	 * @return {*}  {ThemeMode}
	 * @memberof ThemeService
	 */
	getTheme(): ThemeMode {
		return (localStorage.getItem('ui-theme') ?? 'light') as ThemeMode;
	}
}
