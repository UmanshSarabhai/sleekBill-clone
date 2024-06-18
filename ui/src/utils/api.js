export function showmessage(msg) {
    
    window.api.invoke("show-message",{message:msg})
}