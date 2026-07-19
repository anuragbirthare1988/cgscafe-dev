function getCurrentEnvironment() {
    const host = window.location.hostname.toLowerCase();
    if (host.startsWith("localhost")) return "development";
    if (host.startsWith("127.0.0.1")) return "development";
    if (host.startsWith("dev.")) return "development";
    if (host.startsWith("qa.")) return "qa";
    if (host.startsWith("uat.")) return "uat";
    return "production";
}
