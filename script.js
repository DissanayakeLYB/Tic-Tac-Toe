
function taskAdded() {
    let input_task = document.getElementById("taskInput").value;
    taskFunctions(input_task);
}


function taskFunctions(value) {
    const li = document.createElement('li');
    li.textContent = value;
    
    // delete button
    const button = document.createElement('button');
    button.textContent = "❌";

    button.onclick = function() {
        li.remove();
    }

    li.appendChild(button);


    // checkbox for task completion
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');

    checkbox.onclick = function() {
        if (checkbox.checked) {
            li.style.textDecoration = "line-through";
            checkbox.style.textDecoration = "none";
        } else {
            li.style.textDecoration = "none";
        }
    }
    li.appendChild(checkbox);

    document.querySelector('ul').appendChild(li);
    li.appendChild(document.createElement('input type="checkbox"'));
}

