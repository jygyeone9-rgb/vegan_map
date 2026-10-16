import restaurants from './restaurants.json';
import baseMenus from './menus.json';
import enrichments from './menu-enrichments.json';
import { enrichMenus } from '../lib/enrichMenus.js';
const menus = enrichMenus(baseMenus, enrichments);
import interviews from './interviews.json';
import handbookSource from './handbook-source.json';
export { restaurants, menus, interviews, handbookSource };
