$(document).ready(function () {
    $(document).on('keyup',function(e){
        if(e.which == 27){
            $('.basket-popup').fadeOut(300);
        }
    });

    $(document).mouseup(function (e){
        let basketList = $('.basket-popup .basket-list');
        if (!basketList.is(e.target) && basketList.has(e.target).length === 0) {
            $('.basket-popup').fadeOut(300);
        }
    });

    $('.basket-popup').hide();

    $('img').on('dragstart', function (e) {
        e.preventDefault();
    });

    function getBasketCount() {
        $.ajax({
            url:'/getBasketCount',
            success: (res) => {
                $('.basket-count').html(res.count);
            }
        });
    }

    getBasketCount();

    function initBasketProducts() {
        $.ajax({
            url:'/getBasket',
            success: (res) => {
                res.forEach((obj) => {
                    $('.basket-list').append(`
                        <li class="basket-item" data-id="${obj.productId}">
                            <img class="basket-item-title" src="${obj.productImage}" alt="Second item">
                            <h4 class="basket-item-name">${obj.productName}</h4>
                            <span class="basket-item-price">${obj.productPrice}</span>
                            <div class="counter">
                                <span class="counter-plus">+</span>
                                <span class="counter-minus">-</span>
                            </div>
                            <span class="basket-item-count">${obj.productCount}</span>
                            <a class="to-remove" href="#">
                                <img src="images/remove.svg" alt="Remove button">
                            </a>
                        </li>
                    `);
                });

                $('.to-remove').on('click', function(e){
                    e.preventDefault();
                    let productId = $(this).parent().data('id');

                    $.ajax({
                        type: "POST",
                        url: "/deleteFromBasket",
                        data: {
                            productId: productId
                        },
                        success: () => {
                            $('.basket-list .basket-item').remove();
                            initBasketProducts();
                            getBasketCount();
                            console.log(res);
                        },
                        error: (res) => {
                            console.log(res.responseText);
                        },
                    });
                });

                $('.counter-plus').on('click', function (e) {
                    let productId = $(this).parent().parent().data('id');

                    $.ajax({
                        type: "POST",
                        url: "/increaseCountToProduct",
                        data: {
                            productId: productId
                        },
                        success: (res) => {
                            $(this).parent().siblings('.basket-item-count').html(res.currentProductCount);
                        },
                        error: (res) => {
                            console.log(res.responseText);
                        },
                    })
                });

                $('.counter-minus').on('click', function (e) {
                    let productId = $(this).parent().parent().data('id');

                    if($(this).parent().siblings('.basket-item-count').html() === '1') return;

                    $.ajax({
                        type: "POST",
                        url: "/decreaseCountToProduct",
                        data: {
                            productId: productId
                        },
                        success: (res) => {
                            $(this).parent().siblings('.basket-item-count').html(res.currentProductCount);
                        },
                        error: (res) => {
                            console.log(res.responseText);
                        },
                    })
                });
            }
        });
    }

    initBasketProducts();

    $('.basket').on('click', function (e) {
        e.preventDefault();
        $('.basket-popup').fadeToggle(300);
        $('.basket-item').remove();
        initBasketProducts();
    });

    $('.to-basket').on('click', function (e) {
        let productName = $(this).parent().siblings('.product-description').find('.product-name').html();
        let productPrice = $(this).parent().siblings('.product-description').find('.product-price').not('old').html();
        let oldProductPrice = $(this).parent().siblings('.product-description').find('.product-price.old').html();
        let productImage = $(this).siblings('.product-image').attr('src');
        let productId = $(this).parent().parent().data('id');

        $.ajax({
            type: "POST",
            url: '/addToBasket',
            data: {
                productId: productId,
                productName: productName,
                productPrice: productPrice,
                oldProductPrice: oldProductPrice,
                productImage: productImage,
                productCount: 1
            },
            success: (res) => {
                getBasketCount();
                console.log(res);
            },
            error: (res) => {
                console.log(res.responseText);
            },
            dataType: 'json'
        });
    });
});
