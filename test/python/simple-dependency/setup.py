from bs4 import BeautifulSoup
soup = BeautifulSoup('<p>apples, bananas & pears</p>')
print(soup.p.contents[0], end='')
