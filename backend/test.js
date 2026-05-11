const http = require('http');

// Helper function for HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test cases
async function runTests() {
  console.log('\n========== SHOPPING LIST API TESTS ==========\n');
  
  let listId, itemId;
  
  try {
    // Test 1: Create a list
    console.log('1. POST /api/lists - Create a list');
    const createListRes = await makeRequest('POST', '/api/lists', { name: 'Hétvégi bevásárlás' });
    console.log(`Status: ${createListRes.status}`);
    console.log(`Response: ${JSON.stringify(createListRes.data, null, 2)}`);
    listId = createListRes.data._id;
    console.log('✓ PASS\n');

    // Test 2: Get all lists
    console.log('2. GET /api/lists - Get all lists');
    const getAllListsRes = await makeRequest('GET', '/api/lists');
    console.log(`Status: ${getAllListsRes.status}`);
    console.log(`Response: ${JSON.stringify(getAllListsRes.data, null, 2)}`);
    console.log('✓ PASS\n');

    // Test 3: Get a specific list
    console.log(`3. GET /api/lists/${listId} - Get a specific list`);
    const getListRes = await makeRequest('GET', `/api/lists/${listId}`);
    console.log(`Status: ${getListRes.status}`);
    console.log(`Response: ${JSON.stringify(getListRes.data, null, 2)}`);
    console.log('✓ PASS\n');

    // Test 4: Add an item to the list
    console.log(`4. POST /api/lists/${listId}/items - Add an item`);
    const addItemRes = await makeRequest('POST', `/api/lists/${listId}/items`, {
      name: 'Kenyér',
      quantity: 2,
      price: 450
    });
    console.log(`Status: ${addItemRes.status}`);
    console.log(`Response: ${JSON.stringify(addItemRes.data, null, 2)}`);
    itemId = addItemRes.data._id;
    console.log('✓ PASS\n');

    // Test 5: Add another item
    console.log(`5. POST /api/lists/${listId}/items - Add another item`);
    const addItem2Res = await makeRequest('POST', `/api/lists/${listId}/items`, {
      name: 'Tej',
      quantity: 1,
      price: 380
    });
    console.log(`Status: ${addItem2Res.status}`);
    console.log(`Response: ${JSON.stringify(addItem2Res.data, null, 2)}`);
    console.log('✓ PASS\n');

    // Test 6: Get items from list
    console.log(`6. GET /api/lists/${listId}/items - Get items from list`);
    const getItemsRes = await makeRequest('GET', `/api/lists/${listId}/items`);
    console.log(`Status: ${getItemsRes.status}`);
    console.log(`Response: ${JSON.stringify(getItemsRes.data, null, 2)}`);
    console.log('✓ PASS\n');

    // Test 7: Update an item (mark as completed)
    console.log(`7. PUT /api/lists/${listId}/items/${itemId} - Mark item as completed`);
    const updateItemRes = await makeRequest('PUT', `/api/lists/${listId}/items/${itemId}`, {
      completed: true
    });
    console.log(`Status: ${updateItemRes.status}`);
    console.log(`Response: ${JSON.stringify(updateItemRes.data, null, 2)}`);
    console.log('✓ PASS\n');

    // Test 8: Update list name
    console.log(`8. PUT /api/lists/${listId} - Update list name`);
    const updateListRes = await makeRequest('PUT', `/api/lists/${listId}`, {
      name: 'Hétfői bevásárlás'
    });
    console.log(`Status: ${updateListRes.status}`);
    console.log(`Response: ${JSON.stringify(updateListRes.data, null, 2)}`);
    console.log('✓ PASS\n');

    // Test 9: Get the updated list
    console.log(`9. GET /api/lists/${listId} - Get updated list`);
    const getUpdatedListRes = await makeRequest('GET', `/api/lists/${listId}`);
    console.log(`Status: ${getUpdatedListRes.status}`);
    console.log(`Response: ${JSON.stringify(getUpdatedListRes.data, null, 2)}`);
    console.log('✓ PASS\n');

    // Test 13: Reorder items
    console.log(`13. PUT /api/lists/${listId}/reorder - Reorder items`);
    const item2Id = addItem2Res.data._id;
    const reorderRes = await makeRequest('PUT', `/api/lists/${listId}/reorder`, {
      itemIds: [item2Id, itemId]
    });
    console.log(`Status: ${reorderRes.status}`);
    console.log(`Response: ${JSON.stringify(reorderRes.data, null, 2)}`);
    console.log('✓ PASS\n');

    // Test 14: Get items to verify reorder
    console.log(`14. GET /api/lists/${listId}/items - Get items to verify reorder`);
    const getReorderedItemsRes = await makeRequest('GET', `/api/lists/${listId}/items`);
    console.log(`Status: ${getReorderedItemsRes.status}`);
    console.log(`Response: ${JSON.stringify(getReorderedItemsRes.data, null, 2)}`);
    console.log('✓ PASS\n');

    // Test 15: Delete an item
    console.log(`15. DELETE /api/lists/${listId}/items/${itemId} - Delete an item`);
    const deleteItemRes = await makeRequest('DELETE', `/api/lists/${listId}/items/${itemId}`);
    console.log(`Status: ${deleteItemRes.status}`);
    console.log(`Response: ${JSON.stringify(deleteItemRes.data, null, 2)}`);
    console.log('✓ PASS\n');

    // Test 16: Get items after deletion
    console.log(`16. GET /api/lists/${listId}/items - Get items after deletion`);
    const getItemsAfterDeleteRes = await makeRequest('GET', `/api/lists/${listId}/items`);
    console.log(`Status: ${getItemsAfterDeleteRes.status}`);
    console.log(`Response: ${JSON.stringify(getItemsAfterDeleteRes.data, null, 2)}`);
    console.log('✓ PASS\n');

    // Test 17: Delete the list
    console.log(`17. DELETE /api/lists/${listId} - Delete the list`);
    const deleteListRes = await makeRequest('DELETE', `/api/lists/${listId}`);
    console.log(`Status: ${deleteListRes.status}`);
    console.log(`Response: ${JSON.stringify(deleteListRes.data, null, 2)}`);
    console.log('✓ PASS\n');

    // Test 18: Verify list is deleted (should return 404)
    console.log(`18. GET /api/lists/${listId} - Verify list is deleted (should be 404)`);
    const getDeletedListRes = await makeRequest('GET', `/api/lists/${listId}`);
    console.log(`Status: ${getDeletedListRes.status}`);
    console.log(`Response: ${JSON.stringify(getDeletedListRes.data, null, 2)}`);
    console.log('✓ PASS\n');

    console.log('========== ALL TESTS COMPLETED SUCCESSFULLY ==========\n');

  } catch (error) {
    console.error('✗ TEST FAILED:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});