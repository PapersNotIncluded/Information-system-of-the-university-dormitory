package com.example.studentdormitory;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, Long> {
    @Query("""
        SELECT p FROM Student p 
        WHERE (:keyword IS NULL OR LOWER(CONCAT(p.lastName, ' ', p.firstName, ' ', p.patronymic, ' ', p.studentCard)) LIKE :keyword) 
            AND (:group IS NULL OR p.groupNum = :group) 
            AND (:room IS NULL OR p.room = :room) 
            AND (:paid IS NULL OR p.paid = :paid)
    """)
    Page<Student> searchByLastNameOrStudentCard(
            @Param("keyword") String preparedKeyword,
            @Param("group") String group,
            @Param("room") Integer room,
            @Param("paid") Boolean paid,
            Pageable pageable
    );

    @Query("SELECT DISTINCT p.groupNum FROM Student p ORDER BY p.groupNum ASC")
    List<String> findStudentsGroupNums();

    @Query("SELECT DISTINCT p.room FROM Student p ORDER BY p.room ASC")
    List<Integer> findStudentsRoomNums();

    @Query("SELECT p FROM Student p WHERE p.studentCard = :studentCard")
    Optional<Student> checkStudentCardExists(@Param("studentCard") String studentCard);

    int countByRoom(Long room);
}
