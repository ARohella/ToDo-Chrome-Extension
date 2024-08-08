document.querySelector('.create-todo').addEventListener('click', function() {
  const itemsList = document.querySelector('ul.todo-items');
  const newItemHTML = `
    <li class="new-item" draggable="true">
      <input type="text" class="edit-item" placeholder="Type your new task here" />
      <div>
        <span class="itemSave">💾</span>
        <span class="itemCancel">🗑</span>
      </div>
    </li>`;
  itemsList.insertAdjacentHTML('beforeend', newItemHTML);
  
  const newItemElement = itemsList.querySelector('.new-item');
  newItemElement.querySelector('.edit-item').focus();
  newItemElement.querySelector('.itemSave').addEventListener('click', function() {
    saveNewItem(newItemElement);
  });
  newItemElement.querySelector('.itemCancel').addEventListener('click', function() {
    newItemElement.remove();
  });
  newItemElement.querySelector('.edit-item').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      saveNewItem(newItemElement);
    }
  });
});

function saveNewItem(element) {
  const itemName = element.querySelector('.edit-item').value;
  if (itemName !== '') {
    var itemsStorage = localStorage.getItem('todo-items');
    var itemsArr = itemsStorage ? JSON.parse(itemsStorage) : [];
    itemsArr.push({ "item": itemName, "status": 0 });
    saveItems(itemsArr);
    fetchItems();
  } else {
    element.remove();
  }
}

function fetchItems() {
  const itemsList = document.querySelector('ul.todo-items');
  itemsList.innerHTML = '';
  var newItemHTML = '';
  try {
    var itemsStorage = localStorage.getItem('todo-items');
    var itemsArr = itemsStorage ? JSON.parse(itemsStorage) : [];

    for (var i = 0; i < itemsArr.length; i++) {
      var status = '';
      if (itemsArr[i].status == 1) {
        status = 'class="done"';
      }
      newItemHTML += `<li data-itemindex="${i}" ${status} draggable="true">
      <span class="item">${itemsArr[i].item}</span>
      <div><span class="itemComplete">✅</span><span class="itemDelete">🗑</span></div>
      </li>`;
    }

    itemsList.innerHTML = newItemHTML;

    var itemsListUL = document.querySelectorAll('ul li');
    itemsListUL.forEach(function(item) {
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('drop', handleDrop);
      item.addEventListener('dragend', handleDragEnd);
      item.querySelector('.itemComplete').addEventListener('click', function() {
        var index = this.parentNode.parentNode.dataset.itemindex;
        itemToggleComplete(index);
      });
      item.querySelector('.item').addEventListener('click', function() {
        var index = this.parentNode.dataset.itemindex;
        itemEdit(index);
      });
      item.querySelector('.itemDelete').addEventListener('click', function() {
        var index = this.parentNode.parentNode.dataset.itemindex;
        itemDelete(index);
      });
    });
  } catch (e) {
    console.error('Error fetching items:', e); // Debug log
  }
}

function itemToggleComplete(index) {
  var itemsStorage = localStorage.getItem('todo-items');
  var itemsArr = JSON.parse(itemsStorage);

  itemsArr[index].status = itemsArr[index].status == 1 ? 0 : 1;

  saveItems(itemsArr);

  document.querySelector('ul.todo-items li[data-itemindex="' + index + '"]').classList.toggle('done');
}

function itemEdit(index) {
  var itemsStorage = localStorage.getItem('todo-items');
  var itemsArr = JSON.parse(itemsStorage);

  var listItem = document.querySelector('ul.todo-items li[data-itemindex="' + index + '"]');
  var itemText = listItem.querySelector('.item').textContent;

  listItem.innerHTML = `<input type="text" class="edit-item" value="${itemText}" />
  <div><span class="itemSave">💾</span><span class="itemDelete">🗑</span></div>`;

  listItem.querySelector('.itemSave').addEventListener('click', function() {
    var newText = listItem.querySelector('.edit-item').value;
    itemsArr[index].item = newText;
    saveItems(itemsArr);
    fetchItems();
  });

  listItem.querySelector('.itemDelete').addEventListener('click', function() {
    itemDelete(index);
  });
}

function itemDelete(index) {
  var itemsStorage = localStorage.getItem('todo-items');
  var itemsArr = JSON.parse(itemsStorage);

  itemsArr.splice(index, 1);

  saveItems(itemsArr);

  document.querySelector('ul.todo-items li[data-itemindex="' + index + '"]').remove();
}

function saveItems(obj) {
  var string = JSON.stringify(obj);
  localStorage.setItem('todo-items', string);
}

function handleDragStart(e) {
  this.style.opacity = '0.4';
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (dragSrcEl != this) {
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text/html');

    const dragSrcIndex = dragSrcEl.dataset.itemindex;
    const dropTargetIndex = this.dataset.itemindex;

    swapItems(dragSrcIndex, dropTargetIndex);
  }
  return false;
}

function handleDragEnd(e) {
  this.style.opacity = '1.0';
}

function swapItems(fromIndex, toIndex) {
  var itemsStorage = localStorage.getItem('todo-items');
  var itemsArr = itemsStorage ? JSON.parse(itemsStorage) : [];

  const [movedItem] = itemsArr.splice(fromIndex, 1);
  itemsArr.splice(toIndex, 0, movedItem);

  saveItems(itemsArr);
  fetchItems();
}

fetchItems();
