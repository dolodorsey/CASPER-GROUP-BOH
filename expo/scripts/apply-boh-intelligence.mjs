import fs from 'node:fs';
const path='hooks/useSupabaseData.ts';
let source=fs.readFileSync(path,'utf8');
source=source.replace("supabase.from('cg_inventory').select('*').order('name')","supabase.from('cg_inventory_intelligence').select('*').order('attention_score', { ascending: false }).order('name')");
source=source.replace("supabase.from('cg_menu_items').select('*').eq('is_available', true).order('category').order('name')","supabase.from('cg_menu_integrity').select('*').eq('operator_available', true).order('inventory_integrity_score', { ascending: true }).order('category').order('name')");
fs.writeFileSync(path,source);
console.log('CASPER BOH inventory/menu intelligence guards applied');
