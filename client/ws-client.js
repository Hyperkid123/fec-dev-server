x = new WebSocket('ws://localhost:8080')
console.log('WS client')
x.onmessage = (event) => {
    if(event.data === 'refresh') {
        window.location.reload()
    } 
}
