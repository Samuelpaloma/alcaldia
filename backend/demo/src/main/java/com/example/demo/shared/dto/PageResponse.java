package com.example.demo.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    private boolean hasNext;
    private boolean hasPrevious;
    private int numberOfElements;
    
    // Métodos de utilidad
    public boolean isEmpty() {
        return content == null || content.isEmpty();
    }
    
    public boolean hasContent() {
        return !isEmpty();
    }
    
    public int getCurrentPage() {
        return page;
    }
    
    public int getPageSize() {
        return size;
    }
    
    public long getTotalCount() {
        return totalElements;
    }
    
    public boolean isFirstPage() {
        return first;
    }
    
    public boolean isLastPage() {
        return last;
    }
    
    public boolean hasNextPage() {
        return hasNext;
    }
    
    public boolean hasPreviousPage() {
        return hasPrevious;
    }
    
    // Constructor estático para facilitar la creación
    public static <T> PageResponse<T> of(List<T> content, int page, int size, long totalElements, int totalPages, boolean first, boolean last) {
        return PageResponse.<T>builder()
            .content(content)
            .page(page)
            .size(size)
            .totalElements(totalElements)
            .totalPages(totalPages)
            .first(first)
            .last(last)
            .hasNext(!last)
            .hasPrevious(!first)
            .numberOfElements(content != null ? content.size() : 0)
            .build();
    }
}
