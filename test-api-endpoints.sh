#!/bin/bash

# Script untuk test Forum API endpoints
# Jalankan dengan: bash test-api-endpoints.sh

BASE_URL="http://localhost:3000"
echo "Testing Forum API at $BASE_URL"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "\n1. Testing Health Endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" $BASE_URL/health)
STATUS=$(echo "$RESPONSE" | tail -n1)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed (Status: $STATUS)${NC}"
fi

# Test 2: Register User
echo -e "\n2. Testing User Registration..."
RANDOM_USER="testuser_$(date +%s)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$RANDOM_USER\",
    \"password\": \"secret\",
    \"fullname\": \"Test User\"
  }")
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$STATUS" = "201" ]; then
    echo -e "${GREEN}✓ User registration passed${NC}"
    USER_ID=$(echo "$BODY" | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
    echo "  User ID: $USER_ID"
else
    echo -e "${RED}✗ User registration failed (Status: $STATUS)${NC}"
    echo "  Response: $BODY"
fi

# Test 3: Login
echo -e "\n3. Testing Login..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/authentications \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$RANDOM_USER\",
    \"password\": \"secret\"
  }")
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$STATUS" = "201" ]; then
    echo -e "${GREEN}✓ Login passed${NC}"
    ACCESS_TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo "  Token: ${ACCESS_TOKEN:0:50}..."
else
    echo -e "${RED}✗ Login failed (Status: $STATUS)${NC}"
    echo "  Response: $BODY"
    exit 1
fi

# Test 4: Create Thread
echo -e "\n4. Testing Create Thread..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/threads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "title": "Test Thread",
    "body": "This is a test thread body"
  }')
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$STATUS" = "201" ]; then
    echo -e "${GREEN}✓ Create thread passed${NC}"
    THREAD_ID=$(echo "$BODY" | grep -o '"threadId":"[^"]*"' | cut -d'"' -f4)
    echo "  Thread ID: $THREAD_ID"
else
    echo -e "${RED}✗ Create thread failed (Status: $STATUS)${NC}"
    echo "  Response: $BODY"
    exit 1
fi

# Test 5: Get Thread
echo -e "\n5. Testing Get Thread..."
RESPONSE=$(curl -s -w "\n%{http_code}" $BASE_URL/threads/$THREAD_ID)
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Get thread passed${NC}"
else
    echo -e "${RED}✗ Get thread failed (Status: $STATUS)${NC}"
    echo "  Response: $BODY"
fi

# Test 6: Create Comment
echo -e "\n6. Testing Create Comment..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/threads/$THREAD_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "content": "This is a test comment"
  }')
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$STATUS" = "201" ]; then
    echo -e "${GREEN}✓ Create comment passed${NC}"
    COMMENT_ID=$(echo "$BODY" | grep -o '"commentId":"[^"]*"' | cut -d'"' -f4)
    echo "  Comment ID: $COMMENT_ID"
else
    echo -e "${RED}✗ Create comment failed (Status: $STATUS)${NC}"
    echo "  Response: $BODY"
    exit 1
fi

# Test 7: Create Reply
echo -e "\n7. Testing Create Reply..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/threads/$THREAD_ID/comments/$COMMENT_ID/replies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "content": "This is a test reply"
  }')
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$STATUS" = "201" ]; then
    echo -e "${GREEN}✓ Create reply passed${NC}"
    REPLY_ID=$(echo "$BODY" | grep -o '"replyId":"[^"]*"' | cut -d'"' -f4)
    echo "  Reply ID: $REPLY_ID"
else
    echo -e "${RED}✗ Create reply failed (Status: $STATUS)${NC}"
    echo "  Response: $BODY"
fi

# Test 8: Delete Reply
echo -e "\n8. Testing Delete Reply..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE $BASE_URL/threads/$THREAD_ID/comments/$COMMENT_ID/replies/$REPLY_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN")
STATUS=$(echo "$RESPONSE" | tail -n1)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Delete reply passed${NC}"
else
    echo -e "${RED}✗ Delete reply failed (Status: $STATUS)${NC}"
fi

# Test 9: Delete Comment
echo -e "\n9. Testing Delete Comment..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE $BASE_URL/threads/$THREAD_ID/comments/$COMMENT_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN")
STATUS=$(echo "$RESPONSE" | tail -n1)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Delete comment passed${NC}"
else
    echo -e "${RED}✗ Delete comment failed (Status: $STATUS)${NC}"
fi

# Test 10: Logout
echo -e "\n10. Testing Logout..."
REFRESH_TOKEN=$(echo "$BODY" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE $BASE_URL/authentications \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")
STATUS=$(echo "$RESPONSE" | tail -n1)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Logout passed${NC}"
else
    echo -e "${RED}✗ Logout failed (Status: $STATUS)${NC}"
fi

echo -e "\n================================"
echo "All tests completed!"
