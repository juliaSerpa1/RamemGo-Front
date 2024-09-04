document.addEventListener('DOMContentLoaded', () => {
    let selectedBrothId = null;
    let selectedProteinId = null;

    function updateSelection(type, id) {
        document.querySelectorAll(`.card-container[data-type="${type}"] .card`).forEach(card => {
            card.classList.remove('selected');
        });

        const selectedCard = document.querySelector(`.card-container[data-type="${type}"] .card[data-id="${id}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        if (type === 'broth') {
            selectedBrothId = Number(id); // Converta para número
        } else if (type === 'meat') {
            selectedProteinId = Number(id); // Converta para número
        }
    }

    document.querySelectorAll('.card-container[data-type="broth"] .card').forEach(card => {
        card.addEventListener('click', () => {
            updateSelection('broth', card.getAttribute('data-id'));
            fetchDetails('/broths', card.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.card-container[data-type="meat"] .card').forEach(card => {
        card.addEventListener('click', () => {
            updateSelection('meat', card.getAttribute('data-id'));
            fetchDetails('/proteins', card.getAttribute('data-id'));
        });
    });

    function fetchDetails(endpoint, id) {
        const apiBaseUrl = 'http://localhost:3000';
        const url = `${apiBaseUrl}${endpoint}/${id}`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'ZtVdh8XQ2U8pWI2gmZ7f796Vh8GllXoN7mr0djNf' // Substitua pela sua chave de API real
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const card = document.querySelector(`.card-container[data-type="${endpoint.slice(1)}"] .card[data-id="${id}"]`);
            if (card) {
                card.querySelector('img').src = data.imageActive;
                card.querySelector('h3').textContent = data.name;
                card.querySelector('small').textContent = data.description;
                card.querySelector('.price').textContent = `US$ ${data.price}`;
            }
        })
        .catch(error => console.error('Erro ao buscar detalhes:', error));
    }

    document.querySelector('.btn.finalizar').addEventListener('click', (event) => {
        event.preventDefault();

        console.log('Selected Broth ID:', selectedBrothId);
        console.log('Selected Protein ID:', selectedProteinId);

        if (selectedBrothId !== null && selectedProteinId !== null) {
            const order = {
                brothId: selectedBrothId,
                proteinId: selectedProteinId
            };

            console.log('Order being sent:', order);

            fetch('http://localhost:3000/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'ZtVdh8XQ2U8pWI2gmZ7f796Vh8GllXoN7mr0djNf' // Substitua pela sua chave de API real
                },
                body: JSON.stringify(order)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Server response text:', text);
                        throw new Error('Network response was not ok: ' + text);
                    });
                }
                return response.json();
            })
            .then(data => {
                // Verifique o valor retornado e o redirecionamento
                console.log('Order creation successful:', data);
                const redirectUrl = `finalizar.html?id=${data.id}&description=${encodeURIComponent(data.description)}&image=${encodeURIComponent(data.image)}`;
                console.log('Redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
            })
            .catch(error => console.error('Erro ao criar a ordem:', error));
        } else {
            alert('Please select both broth and protein.');
        }
    });
});