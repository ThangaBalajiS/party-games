// Format price in Indian currency format (Lakhs and Crores)
// 1 Lakh = 100,000
// 1 Crore = 10,000,000

export function formatPrice(price) {
    if (price === null || price === undefined) return '';
    
    const num = Number(price);
    if (isNaN(num)) return '';
    if (num === 0) return '0';

    const crore = 10000000; // 1 crore = 1,00,00,000
    const lakh = 100000;    // 1 lakh = 1,00,000

    if (num >= crore) {
        const crores = num / crore;
        // Show decimal only if not a whole number
        return crores % 1 === 0 
            ? `${crores}cr` 
            : `${crores.toFixed(1)}cr`;
    } else if (num >= lakh) {
        const lakhs = num / lakh;
        return lakhs % 1 === 0 
            ? `${lakhs}L` 
            : `${lakhs.toFixed(1)}L`;
    } else if (num >= 1000) {
        // Show in thousands for smaller amounts
        const thousands = num / 1000;
        return thousands % 1 === 0 
            ? `${thousands}K` 
            : `${thousands.toFixed(1)}K`;
    }
    
    return `${num}`;
}

// Format price with rupee symbol
export function formatPriceWithSymbol(price) {
    const formatted = formatPrice(price);
    return formatted ? `₹${formatted}` : '';
}
