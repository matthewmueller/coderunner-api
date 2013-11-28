from bs4 import BeautifulSoup
soup = BeautifulSoup('<p>The law firm of Dewey, Cheatem, & Howe</p>')
print(soup.p, end='')
