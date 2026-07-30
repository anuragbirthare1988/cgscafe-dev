function getCurrentEnvironment() {
    const host = window.location.hostname.toLowerCase();
    
    // 1. Only true production domains belong here (remove dev.cgscafe.in from this list)
    const productionDomains = ["cgscafe.in", "www.cgscafe.in"];
    if (productionDomains.includes(host)) {
        return "production";
    }

    const parts = host.split('.');
    if (parts.length > 2) {
        const sub = parts[0];
        if (sub === 'qa') return 'qa';
        if (sub === 'uat') return 'uat';
        if (sub === 'staging') return 'staging';
        if (sub === 'dev') return 'development'; // Ensures dev.cgscafe.in maps to development
    }

    // 3. Default fallback for local testing
    return "development";
}

const ENVIRONMENTS = {
    development: {
        url: 'https://aastenbsntpdxknonyyr.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhc3RlbmJzbnRwZHhrbm9ueXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjk4MTEsImV4cCI6MjA5NzgwNTgxMX0.C0lfo9Xawq5jvDetw1V-fozdr2jkfwB2Ulk3JMyBhps'
    },
    qa: {
        url: 'https://YOUR_QA_PROJECT_REF.supabase.co',
        anonKey: 'YOUR_QA_KEY'
    },
    uat: {
        url: 'https://YOUR_UAT_PROJECT_REF.supabase.co',
        anonKey: 'YOUR_UAT_KEY'
    },
    production: {
        url: 'https://urpednpniogbowdqocfm.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycGVkbnBuaW9nYm93ZHFvY2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzAwNzcsImV4cCI6MjEwMDkwNjA3N30.CqoSLhuOmHuKtyoAk8Q0N0L0hlewBFDeTrTUhn1hZ20'
    }
};

window.currentEnvName = getCurrentEnvironment();
window.currentConfig = ENVIRONMENTS[window.currentEnvName] || ENVIRONMENTS.development;