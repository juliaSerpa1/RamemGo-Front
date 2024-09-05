document.addEventListener('DOMContentLoaded', () => {
    let selectedBrothId = null;
    let selectedProteinId = null;

    function updateSelection(type, id) {
        document.querySelectorAll(`.card-container[data-type="${type}"] .card`).forEach(card => {
            card.classList.remove('selected');
            const img = card.querySelector('img');
            // Define a imagem inativa padrão
            img.src = img.src.replace('-active.png', '-inactive.png');
        });

        const selectedCard = document.querySelector(`.card-container[data-type="${type}"] .card[data-id="${id}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            const img = selectedCard.querySelector('img');
            // Define a imagem ativa
            img.src = img.src.replace('-inactive.png', '-active.png');
        }

        if (type === 'broth') {
            selectedBrothId = Number(id);
        } else if (type === 'meat') {
            selectedProteinId = Number(id);
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
                'x-api-key': 'ZtVdh8XQ2U8pWI2gmZ7f796Vh8GllXoN7mr0djNf'
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
                    card.querySelector('img').src = data.imageActive; // Define a imagem ativa da resposta
                    card.querySelector('h3').textContent = data.name;
                    card.querySelector('small').textContent = data.description;
                    card.querySelector('.price').textContent = `US$ ${data.price}`;
                }
            })
            .catch(error => console.error('Erro ao buscar detalhes:', error));
    }

    document.querySelector('.btn.sucess').addEventListener('click', (event) => {
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
                    'x-api-key': 'ZtVdh8XQ2U8pWI2gmZ7f796Vh8GllXoN7mr0djNf'
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
                    window.location.href = `sucess.html?id=${data.id}&description=${encodeURIComponent(data.description)}&image=${encodeURIComponent(data.image)}`;
                })
                .catch(error => console.error('Erro ao criar a ordem:', error));
        } else {
            alert('Please select both broth and protein.');
        }
    });
});